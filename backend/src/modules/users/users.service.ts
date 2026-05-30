import { usersRepository } from './users.repository';
import { authRepository } from '../auth/auth.repository';
import { AppError } from '../../lib/AppError';
import { hash, verify } from '../../lib/password';
import type { UpdateProfileInput, UpdatePasswordInput } from './users.schema';

export const usersService = {
  async updateProfile(userId: string, input: UpdateProfileInput) {
    return usersRepository.updateProfile(userId, input);
  },

  getEmailPreferences(userId: string) {
    return usersRepository.getEmailPreferences(userId);
  },

  async updateEmailPreference(userId: string, publicationId: string, newArticle: boolean) {
    await usersRepository.upsertEmailPreference(userId, publicationId, newArticle);
    return { newArticle };
  },

  async updatePassword(userId: string, input: UpdatePasswordInput) {
    const user = await authRepository.findByIdWithPassword(userId);
    if (!user) throw AppError.notFound('User tidak ditemukan');

    if (!user.passwordHash) {
      throw AppError.badRequest(
        'Akun ini menggunakan Google Sign-In dan belum memiliki password.',
        'NO_PASSWORD',
      );
    }

    const valid = await verify(user.passwordHash, input.currentPassword);
    if (!valid) {
      throw AppError.unauthorized('Password saat ini salah', 'WRONG_PASSWORD');
    }

    const newHash = await hash(input.newPassword);
    await authRepository.updatePassword(userId, newHash);

    return { message: 'Password berhasil diubah.' };
  },
};
