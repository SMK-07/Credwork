import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { MongoWorkerRepository } from '../repositories/mongo/MongoWorkerRepository';
import { MongoEmployerRepository } from '../repositories/mongo/MongoEmployerRepository';
import { UserRole } from '../types/enums';

const authService = new AuthService();
const workerRepo = new MongoWorkerRepository();
const employerRepo = new MongoEmployerRepository();

// Phase 8  AuthController handles all auth routes (register, login, OTP)
// Delegates ALL logic to AuthService  no business logic here
export class AuthController {
  public async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, role } = req.body;
      if (!email || !password || !role) {
        res.status(400).json({ error: 'email, password, and role are required' });
        return;
      }
      if (!Object.values(UserRole).includes(role)) {
        res.status(400).json({ error: `Invalid role. Must be one of: ${Object.values(UserRole).join(', ')}` });
        return;
      }

      const result = await authService.register(email, password, role as UserRole);

      // Auto-create worker/employer profile on registration
      if (role === UserRole.WORKER) {
        await workerRepo.create({
          userId: result.userId as unknown as import('mongoose').Types.ObjectId,
          skills: req.body.skills ?? [],
        });
      } else if (role === UserRole.EMPLOYER) {
        await employerRepo.create({
          userId: result.userId as unknown as import('mongoose').Types.ObjectId,
          orgName: req.body.orgName ?? 'My Organisation',
        });
      }

      res.status(201).json({ message: 'Registration successful', ...result });
    } catch (err) {
      next(err);
    }
  }

  public async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ error: 'email and password are required' });
        return;
      }
      const result = await authService.login(email, password);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}
