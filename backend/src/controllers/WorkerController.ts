import { Request, Response, NextFunction } from 'express';
import { WorkerService } from '../services/WorkerService';
import { MongoWorkerRepository } from '../repositories/mongo/MongoWorkerRepository';
import { MongoScoreRepository } from '../repositories/mongo/MongoScoreRepository';
import { MongoEmployerRepository } from '../repositories/mongo/MongoEmployerRepository';
import { MongoVerificationRepository } from '../repositories/mongo/MongoVerificationRepository';
import { VerificationService } from '../services/VerificationService';

const workerRepo = new MongoWorkerRepository();
const scoreRepo = new MongoScoreRepository();
const employerRepo = new MongoEmployerRepository();
const verificationRepo = new MongoVerificationRepository();

const workerService = new WorkerService(workerRepo, scoreRepo, employerRepo);
const verificationService = new VerificationService(verificationRepo, workerRepo);

export class WorkerController {
  public async createProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { skills } = req.body;
      const worker = await workerService.createProfile(userId, skills ?? []);
      res.status(201).json(worker);
    } catch (err) {
      next(err);
    }
  }

  public async uploadVerification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { docType } = req.body;
      const file = req.file;
      if (!file) {
        res.status(400).json({ error: 'Document file is required' });
        return;
      }
      const result = await verificationService.submitVerification(userId, docType ?? 'ID', file.path);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  public async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const profile = await workerService.getProfile(id);
      res.status(200).json(profile);
    } catch (err) {
      next(err);
    }
  }

  public async getScore(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const score = await workerService.getScore(id);
      res.status(200).json(score);
    } catch (err) {
      next(err);
    }
  }
}
