import mongoose from 'mongoose';
import { IApplicationRepository } from '../repositories/interfaces/IApplicationRepository';
import { ApplicationStatus, OutcomeType } from '../types/enums';
import { eventBus } from './EventBus';
import { AppError } from '../utils/StateMachine';
import { stateMachine } from '../utils/StateMachine';

// Phase 7 — ApplicationService
// - Saves application outcomes and emits 'outcome.confirmed' event via EventBus
// - Score update happens in TrustScoreService listener — NOT called directly here (Observer pattern)

export class ApplicationService {
  private readonly appRepo: IApplicationRepository;

  constructor(appRepo: IApplicationRepository) {
    this.appRepo = appRepo;
  }

  public async applyForJob(
    workerId: string,
    jobId: string,
  ): Promise<{ applicationId: string }> {
    // Check for duplicate application
    const existing = await this.appRepo.findByWorkerAndJob(workerId, jobId);
    if (existing) {
      throw new AppError('Worker has already applied for this job', 409);
    }

    const application = await this.appRepo.create({
      workerId: new mongoose.Types.ObjectId(workerId),
      jobId: new mongoose.Types.ObjectId(jobId),
    });

    return { applicationId: (application._id as mongoose.Types.ObjectId).toString() };
  }

  public async getApplication(id: string) {
    const app = await this.appRepo.findById(id);
    if (!app) throw new AppError('Application not found', 404);
    return app;
  }

  public async getApplicationsByJob(jobId: string) {
    return this.appRepo.findByJobId(jobId);
  }

  public async getApplicationsByWorker(workerId: string) {
    return this.appRepo.findByWorkerId(workerId);
  }

  // Save the outcome of a job application and emit the 'outcome.confirmed' event
  // TrustScoreService and NotificationService independently listen to this event
  public async saveOutcome(
    applicationId: string,
    workerId: string,
    outcome: OutcomeType,
    reason?: string,
  ): Promise<void> {
    const app = await this.appRepo.findById(applicationId);
    if (!app) throw new AppError('Application not found', 404);

    // Validate state transition using StateMachine
    const nextStatus =
      outcome === OutcomeType.GHOST
        ? ApplicationStatus.GHOSTED
        : ApplicationStatus.OUTCOME_CONFIRMED;

    stateMachine.transition(app.status, nextStatus);

    await this.appRepo.updateOutcome(applicationId, outcome, reason ?? '', nextStatus);

    // Emit event — observers (TrustScoreService, NotificationService) handle the rest
    eventBus.emit('outcome.confirmed', {
      workerId,
      applicationId,
      outcome,
      reason,
    });
  }

  public async acceptApplication(applicationId: string): Promise<void> {
    const app = await this.appRepo.findById(applicationId);
    if (!app) throw new AppError('Application not found', 404);
    stateMachine.transition(app.status, ApplicationStatus.ACCEPTED);
    await this.appRepo.updateStatus(applicationId, ApplicationStatus.ACCEPTED);
  }
}
