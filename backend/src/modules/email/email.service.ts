import { createHmac } from 'crypto';
import { emailQueue } from './email.queue';
import { prisma } from '../../config/database.config';
import { config } from '../../config';
import type {
  VerificationEmailData,
  ResetPasswordEmailData,
  SubscriptionConfirmedEmailData,
  SubscriptionExpiringEmailData,
  SubscriptionExpiredEmailData,
  NewArticleEmailData,
  AuthorInviteEmailData,
  EmailJobData,
} from './email.types';

function enqueue(job: EmailJobData) {
  return emailQueue.add(job.name, job);
}

// HMAC-signed token for unsubscribe links (avoids storing tokens in Redis)
function signUnsubscribeToken(userId: string, publicationId: string): string {
  const payload = `${userId}:${publicationId}`;
  const sig = createHmac('sha256', config.jwt.accessSecret).update(payload).digest('hex');
  const encoded = Buffer.from(`${payload}:${sig}`).toString('base64url');
  return encoded;
}

export function verifyUnsubscribeToken(
  token: string,
): { userId: string; publicationId: string } | null {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const parts = decoded.split(':');
    if (parts.length !== 3) return null;
    const [userId, publicationId, sig] = parts;
    const expected = createHmac('sha256', config.jwt.accessSecret)
      .update(`${userId}:${publicationId}`)
      .digest('hex');
    if (sig !== expected) return null;
    return { userId, publicationId };
  } catch {
    return null;
  }
}

export const emailService = {
  sendVerification(data: VerificationEmailData) {
    return enqueue({ name: 'send-verification', data });
  },

  sendResetPassword(data: ResetPasswordEmailData) {
    return enqueue({ name: 'send-reset-password', data });
  },

  sendSubscriptionConfirmed(data: SubscriptionConfirmedEmailData) {
    return enqueue({ name: 'send-subscription-confirmed', data });
  },

  sendSubscriptionExpiring(data: SubscriptionExpiringEmailData) {
    return enqueue({ name: 'send-subscription-expiring', data });
  },

  sendSubscriptionExpired(data: SubscriptionExpiredEmailData) {
    return enqueue({ name: 'send-subscription-expired', data });
  },

  sendNewArticle(data: NewArticleEmailData) {
    return enqueue({ name: 'send-new-article', data });
  },

  sendAuthorInvite(data: AuthorInviteEmailData) {
    return enqueue({ name: 'send-author-invite', data });
  },

  // Enqueue new-article notifications to all opted-in active subscribers
  async enqueueNewArticleNotifications(
    publicationId: string,
    publicationName: string,
    article: {
      title: string;
      excerpt: string | null;
      slug: string;
      coverImageUrl: string | null;
    },
  ) {
    const activeSubscriptions = await prisma.subscription.findMany({
      where: {
        publicationId,
        status: 'active',
        expiresAt: { gt: new Date() },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            emailPreferences: { where: { publicationId } },
          },
        },
      },
    });

    const frontendUrl = config.platform.frontendUrl;

    const jobs = activeSubscriptions
      .filter((sub) => {
        const pref = sub.user.emailPreferences[0];
        return !pref || pref.newArticle; // default true if no pref record
      })
      .map((sub) => {
        const unsubToken = signUnsubscribeToken(sub.user.id, publicationId);
        return enqueue({
          name: 'send-new-article',
          data: {
            to: sub.user.email,
            name: sub.user.name,
            publicationName,
            articleTitle: article.title,
            articleExcerpt: article.excerpt ?? '',
            articleUrl: `${frontendUrl}/${article.slug}`,
            coverImageUrl: article.coverImageUrl ?? undefined,
            unsubscribeUrl: `${frontendUrl}/api/email/unsubscribe?token=${unsubToken}`,
          },
        });
      });

    await Promise.all(jobs);
    return jobs.length;
  },

  // Daily job: find subscriptions expiring in ~7 days and send reminder
  async sendExpiryReminders() {
    const now = new Date();
    const from = new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000);
    const to = new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000);

    const expiring = await prisma.subscription.findMany({
      where: {
        status: 'active',
        expiresAt: { gte: from, lte: to },
      },
      include: {
        user: { select: { email: true, name: true } },
        publication: { select: { name: true, slug: true } },
      },
    });

    const frontendUrl = config.platform.frontendUrl;

    for (const sub of expiring) {
      const expiresAt = sub.expiresAt?.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      await this.sendSubscriptionExpiring({
        to: sub.user.email,
        name: sub.user.name,
        publicationName: sub.publication.name,
        expiresAt: expiresAt ?? '-',
        renewUrl: `${frontendUrl}/subscribe?pub=${sub.publication.slug}`,
      });
    }

    return expiring.length;
  },
};
