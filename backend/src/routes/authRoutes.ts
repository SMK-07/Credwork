import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';

const router = Router();
const controller = new AuthController();

// POST /api/auth/register
router.post('/register', (req, res, next) => controller.register(req, res, next));
// POST /api/auth/login
router.post('/login', (req, res, next) => controller.login(req, res, next));

export default router;
