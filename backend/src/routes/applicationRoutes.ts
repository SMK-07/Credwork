import { Router } from 'express';
import { ApplicationController } from '../controllers/ApplicationController';
import { authenticateJWT } from '../middleware/authenticateJWT';
import { authorizeRole } from '../middleware/authorizeRole';
import { UserRole } from '../types/enums';

const router = Router();
const controller = new ApplicationController();

// POST /api/applications  worker applies for a job
router.post(
  '/',
  authenticateJWT,
  authorizeRole(UserRole.WORKER),
  (req, res, next) => controller.applyForJob(req, res, next),
);

// GET /api/applications/my  worker views their own applications
router.get(
  '/my',
  authenticateJWT,
  authorizeRole(UserRole.WORKER),
  (req, res, next) => controller.getMyApplications(req, res, next),
);

// GET /api/applications/:id
router.get('/:id', authenticateJWT, (req, res, next) =>
  controller.getApplication(req, res, next),
);

export default router;
