import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { publicationRepository } from '../publication/publication.repository';
import { AppError } from '../../lib/AppError';
import { config } from '../../config';
import type {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  CompleteAuthorInviteInput,
} from './auth.schema';
import type { GoogleProfile } from '../../config/passport.config';
import type { TenantRequest } from '../../middleware/tenant.middleware';

const PLATFORM_SCOPE = '__platform__';

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
      const user = await authService.register(data, data.ownerInviteToken);
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
      const publicationId = (req as TenantRequest).publication?.id ?? PLATFORM_SCOPE;
      const { accessToken, refreshToken, user } = await authService.login(data, publicationId);

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
        next(AppError.unauthorized('Tidak ada refresh token', 'NO_REFRESH_TOKEN'));
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

  async adminForgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body as ForgotPasswordInput;
      const result = await authService.adminForgotPassword(email);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async adminResetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, password } = req.body as ResetPasswordInput;
      const result = await authService.adminResetPassword(token, password);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async staffForgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body as ForgotPasswordInput;
      // Resolve slug from tenant middleware (prod) or body fallback (dev/local)
      const publicationSlug =
        (req as TenantRequest).publication?.slug ?? body.publicationSlug ?? '';
      if (!publicationSlug) {
        return next(AppError.badRequest('Publication tidak ditemukan', 'NO_PUBLICATION'));
      }
      const result = await authService.staffForgotPassword(body.email, publicationSlug);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async staffResetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, password } = req.body as ResetPasswordInput;
      const result = await authService.staffResetPassword(token, password);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async googleCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const googleUser = req.user as GoogleProfile;
      // pub_id passed via OAuth state param from the login page (member OAuth from publication subdomain)
      const statePublicationId = (req.query.state as string) || '';
      const publicationId =
        statePublicationId || (req as TenantRequest).publication?.id || PLATFORM_SCOPE;
      const { accessToken, refreshToken } = await authService.handleGoogleUser(
        googleUser,
        publicationId,
      );

      res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
      res.redirect(
        `${config.platform.frontendUrl}/auth/google/callback?access_token=${accessToken}`,
      );
    } catch (error) {
      if ((error as { code?: string }).code === 'USE_PASSWORD') {
        return res.redirect(`${config.platform.frontendUrl}/login?error=use_password`);
      }
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

  async adminLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as LoginInput;
      const { accessToken, refreshToken, user } = await authService.adminLogin(data);
      res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
      res.json({ success: true, data: { accessToken, user } });
    } catch (error) {
      next(error);
    }
  },

  async staffLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as LoginInput;
      // Resolve publication: from tenant middleware (prod) or lookup by slug from body (dev/local)
      let publicationId = (req as TenantRequest).publication?.id;
      if (!publicationId && data.publicationSlug) {
        const pub = await publicationRepository.findBySlug(data.publicationSlug);
        if (pub) publicationId = pub.id;
      }
      if (!publicationId) {
        return next(AppError.badRequest('Publication tidak ditemukan', 'NO_PUBLICATION'));
      }
      const { accessToken, refreshToken, user } = await authService.staffLogin(data, publicationId);
      res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
      res.json({ success: true, data: { accessToken, user } });
    } catch (error) {
      next(error);
    }
  },

  async getAuthorInviteMetadata(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.query as { token: string };
      const data = await authService.getAuthorInviteMetadata(token);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async completeAuthorInvite(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body as CompleteAuthorInviteInput;
      const { accessToken, refreshToken, user, publicationSlug } =
        await authService.completeAuthorInvite(body);
      res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
      res.json({ success: true, data: { accessToken, user, publicationSlug } });
    } catch (error) {
      next(error);
    }
  },

  async acceptInvite(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as Request & { user?: { userId: string } }).user!.userId;
      const { token } = req.query as { token: string };
      const result = await authService.acceptInvite(userId, token);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async acceptOwnerInvite(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.query as { token: string };
      if (!token) return next(AppError.badRequest('Token wajib ada'));
      const data = await authService.acceptOwnerInvite(token);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async completeOwnerInvite(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body as {
        token: string;
        name: string;
        password: string;
        publicationName: string;
        publicationSlug: string;
        publicationDescription?: string;
      };
      const { accessToken, refreshToken, user, publicationSlug } =
        await authService.completeOwnerInvite(body);

      res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
      res.json({ success: true, data: { accessToken, user, publicationSlug } });
    } catch (error) {
      next(error);
    }
  },
};
