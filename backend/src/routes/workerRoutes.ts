import { Router } from 'express';
import { WorkerController } from '../controllers/WorkerController';
import { authenticateJWT } from '../middleware/authenticateJWT';
import { authorizeRole } from '../middleware/authorizeRole';
import { multerUpload } from '../middleware/multerUpload';
import { UserRole } from '../types/enums';

const router = Router();
const controller = new WorkerController();

// POST /api/workers  create worker profile (authenticated workers only)
router.post(
  '/',
  authenticateJWT,
  authorizeRole(UserRole.WORKER),
  (req, res, next) => controller.createProfile(req, res, next),
);

// POST /api/workers/verify  upload ID document for verification
router.post(
  '/verify',
  authenticateJWT,
  authorizeRole(UserRole.WORKER),
  multerUpload.single('document'),
  (req, res, next) => controller.uploadVerification(req, res, next),
);

// GET /api/workers/:id/profile  public profile
router.get('/:id/profile', authenticateJWT, (req, res, next) =>
  controller.getProfile(req, res, next),
);

// GET /api/workers/:id/score  trust score and history
router.get('/:id/score', authenticateJWT, (req, res, next) =>
  controller.getScore(req, res, next),
);

export default router;
