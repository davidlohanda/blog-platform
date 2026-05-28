import { prisma } from '../../config/database.config';

export const authRepository = {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, avatarUrl: true, bio: true, emailVerifiedAt: true },
    });
  },

  create(data: { email: string; passwordHash: string; name: string }) {
    return prisma.user.create({ data });
  },

  markEmailVerified(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { emailVerifiedAt: new Date() },
    });
  },

  createEmailVerificationToken(data: { userId: string; token: string; expiresAt: Date }) {
    return prisma.emailVerificationToken.create({ data });
  },

  findEmailVerificationToken(token: string) {
    return prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true },
    });
  },

  deleteEmailVerificationToken(id: string) {
    return prisma.emailVerificationToken.delete({ where: { id } });
  },

  deleteAllEmailVerificationTokens(userId: string) {
    return prisma.emailVerificationToken.deleteMany({ where: { userId } });
  },
};
