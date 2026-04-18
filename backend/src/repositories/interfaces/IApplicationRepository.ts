import mongoose from 'mongoose';
import { IApplicationDocument } from '../../models/ApplicationModel';
import { ApplicationStatus, OutcomeType } from '../../types/enums';

export interface IApplicationRepository {
  findById(id: string): Promise<IApplicationDocument | null>;
  findByWorkerId(workerId: string): Promise<IApplicationDocument[]>;
  findByJobId(jobId: string): Promise<IApplicationDocument[]>;
  findByWorkerAndJob(
    workerId: string,
    jobId: string,
  ): Promise<IApplicationDocument | null>;
  create(data: {
    workerId: mongoose.Types.ObjectId;
    jobId: mongoose.Types.ObjectId;
  }): Promise<IApplicationDocument>;
  updateStatus(id: string, status: ApplicationStatus): Promise<IApplicationDocument | null>;
  updateOutcome(
    id: string,
    outcome: OutcomeType,
    reason: string,
    status: ApplicationStatus,
  ): Promise<IApplicationDocument | null>;
}
