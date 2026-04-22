import { Request, Response, NextFunction } from 'express';
import { JobProcessingService } from '../services/JobProcessingService';
import { ApplicationService } from '../services/ApplicationService';
import { MongoJobRepository } from '../repositories/mongo/MongoJobRepository';
import { MongoWorkerRepository } from '../repositories/mongo/MongoWorkerRepository';
import { MongoEmployerRepository } from '../repositories/mongo/MongoEmployerRepository';
import { MongoApplicationRepository } from '../repositories/mongo/MongoApplicationRepository';
import { OutcomeType } from '../types/enums';

const jobRepo = new MongoJobRepository();
const workerRepo = new MongoWorkerRepository();
const employerRepo = new MongoEmployerRepository();
const appRepo = new MongoApplicationRepository();

const jobService = new JobProcessingService(jobRepo, workerRepo, employerRepo, appRepo);
const applicationService = new ApplicationService(appRepo);

export class JobController {
  public async postJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { title, description, requiredSkills } = req.body;
      if (!title) {
        res.status(400).json({ error: 'title is required' });
        return;
      }
      const job = await jobService.postJob(userId, {
        title,
        description: description ?? '',
        requiredSkills: requiredSkills ?? [],
      });
      res.status(201).json(job);
    } catch (err) {
      next(err);
    }
  }

  public async listJobs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { skill } = req.query;
      const jobs = await jobService.listOpenJobs(skill as string | undefined);
      res.status(200).json(jobs);
    } catch (err) {
      next(err);
    }
  }

  public async getJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const job = await jobService.getJobById(req.params.id);
      res.status(200).json(job);
    } catch (err) {
      next(err);
    }
  }

  public async getEmployerJobs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const jobs = await jobService.getEmployerJobs(userId);
      res.status(200).json(jobs);
    } catch (err) {
      next(err);
    }
  }

  public async assignWorker(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { workerId } = req.body;
      if (!workerId) {
        res.status(400).json({ error: 'workerId is required' });
        return;
      }
      const updated = await jobService.assignWorker(id, workerId);
      res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  }

  public async submitOutcome(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { applicationId, workerId, outcome, reason } = req.body;

      if (!applicationId || !workerId || !outcome) {
        res.status(400).json({ error: 'applicationId, workerId, and outcome are required' });
        return;
      }
      if (!Object.values(OutcomeType).includes(outcome)) {
        res.status(400).json({
          error: `Invalid outcome. Must be one of: \${Object.values(OutcomeType).join(', ')}`,
        });
        return;
      }

      await applicationService.saveOutcome(applicationId, workerId, outcome as OutcomeType, reason);
      res.status(200).json({ message: 'Outcome recorded  score update in progress' });
    } catch (err) {
      next(err);
    }
  }
}
