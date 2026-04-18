import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { authenticateJWT } from '../middleware/authenticateJWT';
import { authorizeRole } from '../middleware/authorizeRole';
import { UserRole } from '../types/enums';

const router = Router();
const controller = new AdminController();

// GET /api/admin/verifications  list pending verifications
router.get(
  '/verifications',
  authenticateJWT,
  authorizeRole(UserRole.ADMIN),
  (req, res, next) => controller.listVerifications(req, res, next),
);

// PATCH /api/admin/verifications/:id  approve or reject a verification
router.patch(
  '/verifications/:id',
  authenticateJWT,
  authorizeRole(UserRole.ADMIN),
  (req, res, next) => controller.updateVerification(req, res, next),
);

export default router;
