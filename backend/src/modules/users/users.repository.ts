import { prisma } from '../../config/database.config';

export const usersRepository = {
  updateProfile(
    userId: string,
    data: { name?: string; bio?: string | null; avatarUrl?: string | null },
  ) {
    return prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        bio: true,
        emailVerifiedAt: true,
      },
    });
  },

  async getEmailPreferences(userId: string) {
    const subscriptions = await prisma.subscription.findMany({
      where: { userId, status: 'active', expiresAt: { gt: new Date() } },
      include: {
        publication: { select: { id: true, name: true, slug: true, logoUrl: true } },
      },
      orderBy: { expiresAt: 'desc' },
      distinct: ['publicationId'],
    });

    const prefRecords = await prisma.emailPreference.findMany({
      where: {
        userId,
        publicationId: { in: subscriptions.map((s) => s.publicationId) },
      },
    });

    const prefMap = new Map(prefRecords.map((p) => [p.publicationId, p.newArticle]));

    return subscriptions.map((sub) => ({
      publicationId: sub.publicationId,
      publicationName: sub.publication.name,
      publicationSlug: sub.publication.slug,
      logoUrl: sub.publication.logoUrl,
      newArticle: prefMap.get(sub.publicationId) ?? true,
    }));
  },

  upsertEmailPreference(userId: string, publicationId: string, newArticle: boolean) {
    return prisma.emailPreference.upsert({
      where: { userId_publicationId: { userId, publicationId } },
      update: { newArticle },
      create: { userId, publicationId, newArticle },
    });
  },
};
