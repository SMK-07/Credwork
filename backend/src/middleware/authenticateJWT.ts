import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';

const authService = new AuthService();

// Extends Express Request to carry typed user info
declare global {
  namespace Express {
    interface Request {
      user?: { userId: string; role: string };
    }
  }
}

// Phase 8 — JWT authentication middleware
// Verifies Bearer token and attaches user to req.user
export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = authService.verifyJWT(token);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};
