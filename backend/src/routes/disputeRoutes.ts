import { Router } from 'express';
import { DisputeController } from '../controllers/DisputeController';
import { authenticateJWT } from '../middleware/authenticateJWT';
import { authorizeRole } from '../middleware/authorizeRole';
import { UserRole } from '../types/enums';

const router = Router();
const controller = new DisputeController();

// POST /api/disputes  worker or employer raises dispute
router.post('/', authenticateJWT, (req, res, next) =>
  controller.raiseDispute(req, res, next),
);

// GET /api/disputes  list all disputes (admin only)
router.get(
  '/',
  authenticateJWT,
  authorizeRole(UserRole.ADMIN),
  (req, res, next) => controller.getAllDisputes(req, res, next),
);

// PATCH /api/disputes/:id/resolve  admin resolves dispute
router.patch(
  '/:id/resolve',
  authenticateJWT,
  authorizeRole(UserRole.ADMIN),
  (req, res, next) => controller.resolveDispute(req, res, next),
);

export default router;
