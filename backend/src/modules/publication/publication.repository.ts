import { prisma } from '../../config/database.config';

export const publicationRepository = {
  create(data: { slug: string; name: string; description?: string; ownerId: string }) {
    return prisma.$transaction(async (tx) => {
      const publication = await tx.publication.create({
        data: { slug: data.slug, name: data.name, description: data.description },
      });
      await tx.publicationAuthor.create({
        data: { publicationId: publication.id, userId: data.ownerId, role: 'owner' },
      });
      return publication;
    });
  },

  findBySlug(slug: string) {
    return prisma.publication.findUnique({ where: { slug } });
  },

  findById(id: string) {
    return prisma.publication.findUnique({ where: { id } });
  },

  findByDomain(domain: string) {
    return prisma.publication.findUnique({ where: { customDomain: domain } });
  },

  findBySlugExists(slug: string) {
    return prisma.publication.count({ where: { slug } });
  },

  findByUserId(userId: string) {
    return prisma.publicationAuthor.findMany({
      where: { userId },
      include: { publication: true },
      orderBy: { joinedAt: 'asc' },
    });
  },

  update(
    id: string,
    data: {
      name?: string;
      description?: string | null;
      logoUrl?: string | null;
      coverUrl?: string | null;
    },
  ) {
    return prisma.publication.update({ where: { id }, data });
  },

  setCustomDomain(id: string, domain: string) {
    return prisma.publication.update({ where: { id }, data: { customDomain: domain } });
  },

  findAuthor(publicationId: string, userId: string) {
    return prisma.publicationAuthor.findUnique({
      where: { publicationId_userId: { publicationId, userId } },
    });
  },

  listAuthors(publicationId: string) {
    return prisma.publicationAuthor.findMany({
      where: { publicationId },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true, bio: true } },
      },
      orderBy: { joinedAt: 'asc' },
    });
  },

  addAuthor(publicationId: string, userId: string, role: 'owner' | 'author') {
    return prisma.publicationAuthor.create({ data: { publicationId, userId, role } });
  },

  updateAuthorRole(publicationId: string, userId: string, role: 'owner' | 'author') {
    return prisma.publicationAuthor.update({
      where: { publicationId_userId: { publicationId, userId } },
      data: { role },
    });
  },

  removeAuthor(publicationId: string, userId: string) {
    return prisma.publicationAuthor.delete({
      where: { publicationId_userId: { publicationId, userId } },
    });
  },

  countOwners(publicationId: string) {
    return prisma.publicationAuthor.count({ where: { publicationId, role: 'owner' } });
  },
};
