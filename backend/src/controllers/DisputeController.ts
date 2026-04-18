import { Request, Response, NextFunction } from 'express';
import { DisputeService } from '../services/DisputeService';
import { MongoDisputeRepository } from '../repositories/mongo/MongoDisputeRepository';
import { MongoApplicationRepository } from '../repositories/mongo/MongoApplicationRepository';

const disputeRepo = new MongoDisputeRepository();
const appRepo = new MongoApplicationRepository();
const disputeService = new DisputeService(disputeRepo, appRepo);

export class DisputeController {
  public async raiseDispute(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const role = req.user!.role;
      const { applicationId, description } = req.body;
      if (!applicationId || !description) {
        res.status(400).json({ error: 'applicationId and description are required' });
        return;
      }
      const dispute = await disputeService.raiseDispute(applicationId, userId, role, description);
      res.status(201).json(dispute);
    } catch (err) {
      next(err);
    }
  }

  public async getAllDisputes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const disputes = await disputeService.getAllDisputes();
      res.status(200).json(disputes);
    } catch (err) {
      next(err);
    }
  }

  public async resolveDispute(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { resolution } = req.body;
      if (!resolution || !['WORKER_FAVOUR', 'WORKER_FAULT'].includes(resolution)) {
        res.status(400).json({ error: 'resolution must be WORKER_FAVOUR or WORKER_FAULT' });
        return;
      }
      const result = await disputeService.resolveDispute(id, resolution);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}
