import mongoose from 'mongoose';
import { IDisputeRepository } from '../repositories/interfaces/IDisputeRepository';
import { IApplicationRepository } from '../repositories/interfaces/IApplicationRepository';
import { DisputeStatus } from '../types/enums';
import { eventBus } from './EventBus';
import { AppError } from '../utils/StateMachine';

// Phase 7  DisputeService handles dispute lifecycle and emits 'dispute.resolved' event
export class DisputeService {
  private readonly disputeRepo: IDisputeRepository;
  private readonly appRepo: IApplicationRepository;

  constructor(disputeRepo: IDisputeRepository, appRepo: IApplicationRepository) {
    this.disputeRepo = disputeRepo;
    this.appRepo = appRepo;
  }

  public async raiseDispute(
    applicationId: string,
    raisedByUserId: string,
    raisedByRole: string,
    description: string,
  ) {
    const app = await this.appRepo.findById(applicationId);
    if (!app) throw new AppError('Application not found', 404);

    const dispute = await this.disputeRepo.create({
      applicationId: app._id as mongoose.Types.ObjectId,
      raisedBy: new mongoose.Types.ObjectId(raisedByUserId),
      raisedByRole,
      description,
    });

    return dispute;
  }

  public async getAllDisputes() {
    return this.disputeRepo.findAll();
  }

  public async getOpenDisputes() {
    return this.disputeRepo.findAllOpen();
  }

  // Admin resolves dispute  emits 'dispute.resolved' so TrustScoreService applies delta
  public async resolveDispute(
    disputeId: string,
    resolution: 'WORKER_FAVOUR' | 'WORKER_FAULT',
  ) {
    const dispute = await this.disputeRepo.findById(disputeId);
    if (!dispute) throw new AppError('Dispute not found', 404);
    if (dispute.status === DisputeStatus.RESOLVED) {
      throw new AppError('Dispute is already resolved', 400);
    }

    await this.disputeRepo.updateStatus(disputeId, DisputeStatus.RESOLVED, resolution);

    // Fetch application to get workerId for the TrustScoreService
    const app = await this.appRepo.findById(dispute.applicationId.toString());
    if (!app) throw new AppError('Associated application not found', 404);

    // Emit event  TrustScoreService listener handles score update (Observer pattern)
    eventBus.emit('dispute.resolved', {
      workerId: app.workerId.toString(),
      applicationId: app._id ? (app._id as mongoose.Types.ObjectId).toString() : '',
      resolution,
      description: dispute.description,
    });

    return { success: true, resolution };
  }
}
