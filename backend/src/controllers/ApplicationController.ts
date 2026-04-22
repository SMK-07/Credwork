import { Request, Response, NextFunction } from 'express';
import { ApplicationService } from '../services/ApplicationService';
import { MongoApplicationRepository } from '../repositories/mongo/MongoApplicationRepository';
import { MongoWorkerRepository } from '../repositories/mongo/MongoWorkerRepository';
import { AppError } from '../utils/StateMachine';

const appRepo = new MongoApplicationRepository();
const workerRepo = new MongoWorkerRepository();
const applicationService = new ApplicationService(appRepo);

export class ApplicationController {
  public async applyForJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { jobId } = req.body;

      if (!jobId) {
        res.status(400).json({ error: 'jobId is required' });
        return;
      }

      // Resolve Worker Profile from User ID
      const worker = await workerRepo.findByUserId(userId);
      if (!worker) {
        throw new AppError('Worker profile not found. Please complete your profile first.', 404);
      }

      const result = await applicationService.applyForJob(
        (worker._id as any).toString(),
        jobId
      );
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  public async getApplication(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const app = await applicationService.getApplication(req.params.id);
      res.status(200).json(app);
    } catch (err) {
      next(err);
    }
  }

  public async getJobApplications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { jobId } = req.params;
      const apps = await applicationService.getApplicationsByJob(jobId);
      res.status(200).json(apps);
    } catch (err) {
      next(err);
    }
  }

  public async getMyApplications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const worker = await workerRepo.findByUserId(userId);
      if (!worker) {
        throw new AppError('Worker profile not found', 404);
      }
      const apps = await applicationService.getApplicationsByWorker((worker._id as any).toString());
      res.status(200).json(apps);
    } catch (err) {
      next(err);
    }
  }
}
