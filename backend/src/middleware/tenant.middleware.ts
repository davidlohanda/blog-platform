import { Request, Response, NextFunction } from 'express';
import { publicationService } from '../modules/publication/publication.service';
import { config } from '../config';

export interface TenantRequest extends Request {
  publication?: {
    id: string;
    slug: string;
    name: string;
    customDomain: string | null;
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
      (req as TenantRequest).publication = {
        id: publication.id,
        slug: publication.slug,
        name: publication.name,
        customDomain: publication.customDomain,
      };
    }

    next();
  } catch (error) {
    next(error);
  }
}
