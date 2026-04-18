import mongoose from 'mongoose';
import { IVerificationDocument } from '../../models/VerificationModel';
import { VerificationStatus } from '../../types/enums';

export interface IVerificationRepository {
  findByWorkerId(workerId: string): Promise<IVerificationDocument[]>;
  findAllPending(): Promise<IVerificationDocument[]>;
  findById(id: string): Promise<IVerificationDocument | null>;
  create(data: {
    workerId: mongoose.Types.ObjectId;
    docType: string;
    docPath: string;
  }): Promise<IVerificationDocument>;
  updateStatus(
    id: string,
    status: VerificationStatus,
    adminNote?: string,
  ): Promise<IVerificationDocument | null>;
}
