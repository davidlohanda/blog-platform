import { Router } from 'express';
import { adminController } from './admin.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { adminGuard } from '../../middleware/adminGuard.middleware';

const router = Router();

router.use(authenticate, adminGuard);

router.get('/overview', (req, res, next) => adminController.getOverview(req, res, next));
router.get('/publications', (req, res, next) => adminController.listPublications(req, res, next));
router.get('/users', (req, res, next) => adminController.listUsers(req, res, next));
router.post('/invite-owner', (req, res, next) => adminController.inviteOwner(req, res, next));

export { router as adminRouter };
