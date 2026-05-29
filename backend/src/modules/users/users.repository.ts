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
};
