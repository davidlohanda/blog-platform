import { Router } from 'express';
import { emailController } from './email.controller';

const router = Router();

// GET /email/unsubscribe?token=xxx
router.get('/unsubscribe', (req, res, next) => emailController.unsubscribe(req, res, next));

// POST /email/webhook/resend — Resend bounce/event webhook
router.post('/webhook/resend', (req, res, next) => emailController.resendWebhook(req, res, next));

export { router as emailRouter };
