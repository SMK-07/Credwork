import { Request, Response, NextFunction } from 'express';
import { ApplicationService } from '../services/ApplicationService';
import { MongoApplicationRepository } from '../repositories/mongo/MongoApplicationRepository';

const appRepo = new MongoApplicationRepository();
const applicationService = new ApplicationService(appRepo);

export class ApplicationController {
  public async applyForJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { jobId, workerId } = req.body;
      const wid = workerId ?? userId; // if workerId not given, use authenticated user
      if (!jobId) {
        res.status(400).json({ error: 'jobId is required' });
        return;
      }
      const result = await applicationService.applyForJob(wid, jobId);
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
}
