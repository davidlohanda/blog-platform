import { randomUUID } from 'crypto';
import { publicationRepository } from './publication.repository';
import { prisma } from '../../config/database.config';
import { AppError } from '../../lib/AppError';
import { redis } from '../../config/redis.config';
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
