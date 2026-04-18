import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types/enums';

// Phase 8 — Role-based authorization middleware factory
// Returns middleware that guards routes by UserRole
export const authorizeRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized — no user on request' });
      return;
    }

    if (!allowedRoles.includes(req.user.role as UserRole)) {
      res.status(403).json({
        error: `Forbidden — requires role: ${allowedRoles.join(' or ')}`,
      });
      return;
    }

    next();
  };
};
