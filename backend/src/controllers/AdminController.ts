import { Request, Response, NextFunction } from 'express';
import { VerificationService } from '../services/VerificationService';
import { MongoVerificationRepository } from '../repositories/mongo/MongoVerificationRepository';
import { MongoWorkerRepository } from '../repositories/mongo/MongoWorkerRepository';

const verificationRepo = new MongoVerificationRepository();
const workerRepo = new MongoWorkerRepository();
const verificationService = new VerificationService(verificationRepo, workerRepo);

export class AdminController {
  public async listVerifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const verifications = await verificationService.getPendingVerifications();
      res.status(200).json(verifications);
    } catch (err) {
      next(err);
    }
  }

  public async updateVerification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { action, adminNote } = req.body;

      if (!action || !['approve', 'reject'].includes(action)) {
        res.status(400).json({ error: 'action must be approve or reject' });
        return;
      }

      let result;
      if (action === 'approve') {
        result = await verificationService.approveVerification(id, adminNote);
      } else {
        result = await verificationService.rejectVerification(id, adminNote);
      }

      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}
