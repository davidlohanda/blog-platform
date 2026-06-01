import { randomUUID } from 'crypto';
import { publicationRepository } from './publication.repository';
import { subscriptionRepository } from '../subscription/subscription.repository';
import { emailService } from '../email/email.service';
import { authRepository } from '../auth/auth.repository';
import { verify } from '../../lib/password';
import { prisma } from '../../config/database.config';
import { AppError } from '../../lib/AppError';
import { redis } from '../../config/redis.config';
import { config } from '../../config';
import { log } from '../../lib/logger';
import type {
  CreatePublicationInput,
  UpdatePublicationInput,
  SetCustomDomainInput,
} from './publication.schema';

const CACHE_TTL = 60 * 60; // 1 hour

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}

async function uniqueSlug(base: string): Promise<string> {
  const exists = await publicationRepository.findBySlugExists(base);
  if (!exists) return base;
  // append short random suffix to avoid enumeration
  return `${base}-${randomUUID().slice(0, 6)}`;
}

async function cachePublication(pub: { id: string; slug: string; customDomain?: string | null }) {
  const json = JSON.stringify(pub);
  await Promise.all([
    redis.setex(`pub:slug:${pub.slug}`, CACHE_TTL, json),
    pub.customDomain
      ? redis.setex(`pub:domain:${pub.customDomain}`, CACHE_TTL, json)
      : Promise.resolve(),
  ]);
}

async function invalidateCache(pub: { slug: string; customDomain?: string | null }) {
  await Promise.all([
    redis.del(`pub:slug:${pub.slug}`),
    pub.customDomain ? redis.del(`pub:domain:${pub.customDomain}`) : Promise.resolve(),
  ]);
}

export const publicationService = {
  async create(userId: string, input: CreatePublicationInput) {
    const baseSlug = input.slug ?? toSlug(input.name);
    if (!baseSlug)
      throw AppError.badRequest('Nama tidak valid untuk menghasilkan slug', 'INVALID_NAME');

    const slug = await uniqueSlug(baseSlug);
    const pub = await publicationRepository.create({
      slug,
      name: input.name,
      description: input.description,
      ownerId: userId,
    });
    await cachePublication(pub);
    return pub;
  },

  async getBySlug(slug: string) {
    const cached = await redis.get(`pub:slug:${slug}`);
    if (cached)
      return JSON.parse(cached) as Awaited<ReturnType<typeof publicationRepository.findBySlug>>;

    const pub = await publicationRepository.findBySlug(slug);
    if (!pub) throw AppError.notFound('Publication tidak ditemukan');
    await cachePublication(pub);
    return pub;
  },

  async getById(id: string) {
    const pub = await publicationRepository.findById(id);
    if (!pub) throw AppError.notFound('Publication tidak ditemukan');
    return pub;
  },

  async getByDomain(domain: string) {
    const cached = await redis.get(`pub:domain:${domain}`);
    if (cached)
      return JSON.parse(cached) as Awaited<ReturnType<typeof publicationRepository.findByDomain>>;

    const pub = await publicationRepository.findByDomain(domain);
    if (!pub) return null;
    await cachePublication(pub);
    return pub;
  },

  async getForUser(userId: string) {
    const memberships = await publicationRepository.findByUserId(userId);
    return memberships.map((m) => ({ ...m.publication, role: m.role, joinedAt: m.joinedAt }));
  },

  async update(publicationId: string, input: UpdatePublicationInput) {
    const pub = await publicationRepository.findById(publicationId);
    if (!pub) throw AppError.notFound('Publication tidak ditemukan');

    const updated = await publicationRepository.update(publicationId, input);
    await invalidateCache(pub);
    await cachePublication(updated);
    return updated;
  },

  async setCustomDomain(publicationId: string, input: SetCustomDomainInput) {
    const pub = await publicationRepository.findById(publicationId);
    if (!pub) throw AppError.notFound('Publication tidak ditemukan');

    // Check if domain already taken by another publication
    const existing = await publicationRepository.findByDomain(input.domain);
    if (existing && existing.id !== publicationId) {
      throw AppError.conflict('Domain sudah digunakan oleh publication lain', 'DOMAIN_TAKEN');
    }

    await invalidateCache(pub);
    const updated = await publicationRepository.setCustomDomain(publicationId, input.domain);
    await cachePublication(updated);

    // Reset domain status to pending (DNS job will verify)
    await prisma.publication.update({
      where: { id: publicationId },
      data: { customDomainStatus: 'pending' },
    });

    return { ...updated, customDomainStatus: 'pending' as const };
  },

  async listAuthors(publicationId: string) {
    return publicationRepository.listAuthors(publicationId);
  },

  async updateAuthorRole(publicationId: string, targetUserId: string, role: 'owner' | 'author') {
    const member = await publicationRepository.findAuthor(publicationId, targetUserId);
    if (!member) throw AppError.notFound('Author tidak ditemukan di publication ini');

    return publicationRepository.updateAuthorRole(publicationId, targetUserId, role);
  },

  async getOnboardingStatus(publicationId: string) {
    const pub = await publicationRepository.findById(publicationId);
    if (!pub) throw AppError.notFound('Publication tidak ditemukan');
    return publicationRepository.getOnboardingStatus(publicationId);
  },

  async checkSlugAvailability(slug: string, excludeId?: string) {
    const existing = await publicationRepository.findBySlug(slug);
    const taken = !!existing && existing.id !== excludeId;

    if (!taken) return { available: true };

    // Generate suggestion: slug-2, slug-3, ...
    let counter = 2;
    while (counter <= 10) {
      const candidate = `${slug}-${counter}`;
      const candidateExists = await publicationRepository.findBySlug(candidate);
      if (!candidateExists || candidateExists.id === excludeId) {
        return { available: false, suggestion: candidate };
      }
      counter++;
    }
    return { available: false, suggestion: `${slug}-${Date.now().toString().slice(-4)}` };
  },

  // Story 15.4 — request deletion with 30-day cooling period
  async requestDeletion(publicationId: string, requestingUserId: string) {
    const pub = await publicationRepository.findById(publicationId);
    if (!pub) throw AppError.notFound('Publication tidak ditemukan');
    if (pub.status === 'pending_deletion') {
      throw AppError.conflict('Publication sudah dalam proses penghapusan', 'ALREADY_PENDING');
    }

    const scheduledDeletionAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await prisma.publication.update({
      where: { id: publicationId },
      data: { status: 'pending_deletion', scheduledDeletionAt },
    });

    // Refund all active subscribers
    const activeSubscriptions =
      await subscriptionRepository.findAllActiveForPublication(publicationId);
    const now = new Date();

    for (const sub of activeSubscriptions) {
      if (!sub.startedAt || !sub.expiresAt) continue;
      const totalDays = Math.ceil(
        (sub.expiresAt.getTime() - sub.startedAt.getTime()) / (1000 * 60 * 60 * 24),
      );
      const daysRemaining = Math.max(
        0,
        Math.ceil((sub.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
      );
      const refundAmount =
        totalDays > 0 ? Math.round((Number(sub.grossAmount) * daysRemaining) / totalDays) : 0;
      log.info(`[Publication] Deletion refund: sub ${sub.id} — Rp ${refundAmount}`);
      await subscriptionRepository.updateSubscription(sub.id, { status: 'cancelled' });
    }

    // Email owner
    const owner = await authRepository.findById(requestingUserId);
    if (owner) {
      const cancelUrl = `${config.platform.frontendUrl}/dashboard/settings`;
      await emailService.sendPublicationDeletionRequested({
        to: owner.email,
        name: owner.name,
        publicationName: pub.name,
        scheduledDeletionAt: scheduledDeletionAt.toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
        cancelUrl,
      });
    }

    return { scheduledDeletionAt };
  },

  async cancelDeletion(publicationId: string) {
    const pub = await publicationRepository.findById(publicationId);
    if (!pub) throw AppError.notFound('Publication tidak ditemukan');
    if (pub.status !== 'pending_deletion') {
      throw AppError.conflict('Publication tidak sedang dalam proses penghapusan', 'NOT_PENDING');
    }

    await prisma.publication.update({
      where: { id: publicationId },
      data: { status: 'active', scheduledDeletionAt: null },
    });

    return { message: 'Penghapusan dibatalkan. Publication kembali aktif.' };
  },

  // Story 15.5 — transfer ownership
  async requestTransferOwnership(
    publicationId: string,
    currentOwnerId: string,
    newOwnerId: string,
    password: string,
  ) {
    const pub = await publicationRepository.findById(publicationId);
    if (!pub) throw AppError.notFound('Publication tidak ditemukan');

    const currentOwnerBasic = await authRepository.findById(currentOwnerId);
    if (!currentOwnerBasic) throw AppError.notFound('User tidak ditemukan');
    const currentOwner = await authRepository.findByIdWithPassword(currentOwnerId);

    // Verify password
    if (!currentOwner?.passwordHash) {
      throw AppError.badRequest('Akun ini tidak memiliki password', 'NO_PASSWORD');
    }
    const valid = await verify(currentOwner.passwordHash, password);
    if (!valid) throw AppError.unauthorized('Password salah', 'WRONG_PASSWORD');

    // Validate newOwner is already a member
    const newOwnerMembership = await publicationRepository.findAuthor(publicationId, newOwnerId);
    if (!newOwnerMembership) {
      throw AppError.badRequest(
        'Penerima harus sudah menjadi anggota publication ini',
        'NOT_MEMBER',
      );
    }
    if (newOwnerId === currentOwnerId) {
      throw AppError.badRequest('Tidak bisa transfer ke diri sendiri', 'SAME_USER');
    }

    const newOwner = await authRepository.findById(newOwnerId);
    if (!newOwner) throw AppError.notFound('Penerima tidak ditemukan');

    // Store transfer token in Redis (48h)
    const token = randomUUID();
    await redis.setex(
      `ownership-transfer:${token}`,
      48 * 60 * 60,
      JSON.stringify({ publicationId, currentOwnerId, newOwnerId }),
    );

    const frontendUrl = config.platform.frontendUrl;
    const acceptUrl = `${frontendUrl}/accept-ownership-transfer?token=${token}`;

    await emailService.sendOwnershipTransferRequest({
      to: newOwner.email,
      newOwnerName: newOwner.name,
      publicationName: pub.name,
      acceptUrl,
    });

    return { message: `Email konfirmasi dikirim ke ${newOwner.email}` };
  },

  async acceptTransferOwnership(token: string) {
    const raw = await redis.get(`ownership-transfer:${token}`);
    if (!raw)
      throw AppError.badRequest('Token tidak valid atau sudah kedaluwarsa', 'INVALID_TOKEN');

    const { publicationId, currentOwnerId, newOwnerId } = JSON.parse(raw) as {
      publicationId: string;
      currentOwnerId: string;
      newOwnerId: string;
    };

    const pub = await publicationRepository.findById(publicationId);
    if (!pub) throw AppError.notFound('Publication tidak ditemukan');

    // newOwner → owner, currentOwner → admin
    await prisma.$transaction([
      prisma.publicationAuthor.update({
        where: { publicationId_userId: { publicationId, userId: newOwnerId } },
        data: { role: 'owner' },
      }),
      prisma.publicationAuthor.update({
        where: { publicationId_userId: { publicationId, userId: currentOwnerId } },
        data: { role: 'admin' },
      }),
    ]);

    await redis.del(`ownership-transfer:${token}`);

    // Notify both
    const [currentOwner, newOwner] = await Promise.all([
      authRepository.findById(currentOwnerId), // currentOwnerBasic reused
      authRepository.findById(newOwnerId),
    ]);

    if (newOwner) {
      await emailService.sendOwnershipTransferConfirmed({
        to: newOwner.email,
        name: newOwner.name,
        publicationName: pub.name,
        isNewOwner: true,
      });
    }
    if (currentOwner) {
      await emailService.sendOwnershipTransferConfirmed({
        to: currentOwner.email,
        name: currentOwner.name,
        publicationName: pub.name,
        isNewOwner: false,
      });
    }

    return { message: 'Transfer ownership berhasil.' };
  },

  async removeAuthor(publicationId: string, requestingUserId: string, targetUserId: string) {
    if (requestingUserId === targetUserId) {
      const ownerCount = await publicationRepository.countOwners(publicationId);
      const member = await publicationRepository.findAuthor(publicationId, requestingUserId);
      if (member?.role === 'owner' && ownerCount <= 1) {
        throw AppError.badRequest(
          'Tidak bisa menghapus diri sendiri jika kamu satu-satunya owner',
          'LAST_OWNER',
        );
      }
    }

    const member = await publicationRepository.findAuthor(publicationId, targetUserId);
    if (!member) throw AppError.notFound('Author tidak ditemukan di publication ini');

    await publicationRepository.removeAuthor(publicationId, targetUserId);
    return { message: 'Author berhasil dihapus' };
  },
};
