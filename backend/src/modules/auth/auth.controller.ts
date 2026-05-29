import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { config } from '../../config';
import type {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from './auth.schema';
import type { GoogleProfile } from '../../config/passport.config';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in ms
  path: '/',
};

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as RegisterInput;
      const user = await authService.register(data);
      res.status(201).json({
        success: true,
        data: {
          message: 'Akun berhasil dibuat. Cek email kamu untuk verifikasi.',
          user,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.query as { token: string };
      const result = await authService.verifyEmail(token);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as LoginInput;
      const { accessToken, refreshToken, user } = await authService.login(data);

      res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
      res.json({
        success: true,
        data: { accessToken, user },
      });
    } catch (error) {
      next(error);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshTokenCookie = req.cookies?.refreshToken as string | undefined;
      if (!refreshTokenCookie) {
        res
          .status(401)
          .json({ success: false, error: 'NO_REFRESH_TOKEN', message: 'Tidak ada refresh token' });
        return;
      }

      const { accessToken, newRefreshToken, user } = await authService.refresh(refreshTokenCookie);

      res.cookie('refreshToken', newRefreshToken, REFRESH_COOKIE_OPTIONS);
      res.json({ success: true, data: { accessToken, user } });
    } catch (error) {
      next(error);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshTokenCookie = req.cookies?.refreshToken as string | undefined;
      const userId = (req as Request & { user?: { userId: string } }).user?.userId;

      if (userId && refreshTokenCookie) {
        await authService.logout(userId, refreshTokenCookie);
      }

      res.clearCookie('refreshToken', { path: '/' });
      res.json({ success: true, data: { message: 'Berhasil logout' } });
    } catch (error) {
      next(error);
    }
  },

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body as ForgotPasswordInput;
      const result = await authService.forgotPassword(email);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, password } = req.body as ResetPasswordInput;
      const result = await authService.resetPassword(token, password);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async googleCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const googleUser = req.user as GoogleProfile;
      const { accessToken, refreshToken } = await authService.handleGoogleUser(googleUser);

      res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
      res.redirect(
        `${config.platform.frontendUrl}/auth/google/callback?access_token=${accessToken}`,
      );
    } catch (error) {
      next(error);
    }
  },

  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as Request & { user?: { userId: string } }).user!.userId;
      const user = await authService.getMe(userId);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  },
};
