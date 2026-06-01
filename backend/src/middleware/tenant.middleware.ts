import { Request, Response, NextFunction } from 'express';
import { publicationService } from '../modules/publication/publication.service';
import { config } from '../config';

export interface TenantRequest extends Request {
  publication?: {
    id: string;
    slug: string;
    name: string;
    customDomain: string | null;
    status: string;
    isSuspendedSoft: boolean;
  };
}

const APP_DOMAINS = new Set([
  config.platform.baseDomain.replace(/^[^.]+\./, ''), // root domain
  `app.${config.platform.baseDomain}`,
  'localhost',
  '127.0.0.1',
]);

export async function tenantMiddleware(req: Request, _res: Response, next: NextFunction) {
  try {
    const host = (req.headers.host ?? '').replace(/:\d+$/, '').toLowerCase();

    // Dashboard / app domain — no tenant context needed
    if (APP_DOMAINS.has(host)) return next();

    const baseDomain = config.platform.baseDomain;
    let publication = null;

    if (host.endsWith(`.${baseDomain}`)) {
      const slug = host.slice(0, host.length - baseDomain.length - 1);
      publication = await publicationService.getBySlug(slug).catch(() => null);
    } else {
      // Custom domain
      publication = await publicationService.getByDomain(host);
    }

    if (publication) {
      const status = (publication as { status?: string }).status ?? 'active';

      // suspended_hard and pending_deletion: block public reader access with 503
      if (status === 'suspended_hard' || status === 'pending_deletion') {
        _res.status(503).json({
          success: false,
          error: 'SERVICE_UNAVAILABLE',
          message: 'Publication ini tidak tersedia saat ini.',
        });
        return;
      }

      (req as TenantRequest).publication = {
        id: publication.id,
        slug: publication.slug,
        name: publication.name,
        customDomain: publication.customDomain,
        status,
        isSuspendedSoft: status === 'suspended_soft',
      };
    }

    next();
  } catch (error) {
    next(error);
  }
}
