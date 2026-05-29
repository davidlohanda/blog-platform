import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { generateUploadSignature } from './cloudinary.service';

const router = Router();

router.get('/upload-url', authenticate, (req, res, next) => {
  try {
    const folder = (req.query.folder as string) || 'lentera/articles';
    const params = generateUploadSignature(folder);
    res.json({ success: true, data: params });
  } catch (error) {
    next(error);
  }
});

export { router as mediaRouter };
