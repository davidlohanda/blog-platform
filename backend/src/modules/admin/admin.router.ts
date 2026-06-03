import { Router } from 'express';
import { adminController } from './admin.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { adminGuard, ownerGuard } from '../../middleware/adminGuard.middleware';
import { validate } from '../../middleware/validate.middleware';
import { z } from 'zod';

const router = Router();

router.use(authenticate, adminGuard);

router.get('/overview', (req, res, next) => adminController.getOverview(req, res, next));
router.get('/publications', (req, res, next) => adminController.listPublications(req, res, next));
router.get('/users', (req, res, next) => adminController.listUsers(req, res, next));
router.post('/invite-owner', (req, res, next) => adminController.inviteOwner(req, res, next));

// Story 15.1 — platform fee
router.patch(
  '/publications/:id/fee',
  validate(z.object({ feePercent: z.number().min(0).max(100) })),
  (req, res, next) => adminController.updateFee(req, res, next),
);

// Story 15.2 — impersonate
router.post('/impersonate/:userId', (req, res, next) =>
  adminController.impersonate(req, res, next),
);

// Story 15.3 — suspend / unsuspend
router.patch(
  '/publications/:id/suspend',
  validate(z.object({ level: z.union([z.literal(1), z.literal(2)]), reason: z.string().min(1) })),
  (req, res, next) => adminController.suspendPublication(req, res, next),
);
router.patch('/publications/:id/unsuspend', (req, res, next) =>
  adminController.unsuspendPublication(req, res, next),
);

// Story 15.6 — platform staff management (platform_owner only)
router.get('/staff', ownerGuard, (req, res, next) =>
  adminController.listPlatformStaff(req, res, next),
);
router.post(
  '/staff',
  ownerGuard,
  validate(z.object({ email: z.string().email(), name: z.string().min(2) })),
  (req, res, next) => adminController.createPlatformStaff(req, res, next),
);
router.delete('/staff/:userId', ownerGuard, (req, res, next) =>
  adminController.deletePlatformStaff(req, res, next),
);
router.patch(
  '/staff/:userId/role',
  ownerGuard,
  validate(z.object({ role: z.enum(['platform_admin', 'platform_owner']) })),
  (req, res, next) => adminController.updatePlatformStaffRole(req, res, next),
);

export { router as adminRouter };
