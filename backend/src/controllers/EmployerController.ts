import { Request, Response, NextFunction } from 'express';
import { EmployerService } from '../services/EmployerService';
import { MongoEmployerRepository } from '../repositories/mongo/MongoEmployerRepository';

const employerRepo = new MongoEmployerRepository();
const employerService = new EmployerService(employerRepo);

export class EmployerController {
  public async createProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { orgName } = req.body;
      if (!orgName) {
        res.status(400).json({ error: 'orgName is required' });
        return;
      }
      const employer = await employerService.createProfile(userId, orgName);
      res.status(201).json(employer);
    } catch (err) {
      next(err);
    }
  }
}
