import mongoose from 'mongoose';
import { IDisputeDocument } from '../../models/DisputeModel';
import { DisputeStatus } from '../../types/enums';

export interface IDisputeRepository {
  findById(id: string): Promise<IDisputeDocument | null>;
  findAllOpen(): Promise<IDisputeDocument[]>;
  findAll(): Promise<IDisputeDocument[]>;
  create(data: {
    applicationId: mongoose.Types.ObjectId;
    raisedBy: mongoose.Types.ObjectId;
    raisedByRole: string;
    description: string;
  }): Promise<IDisputeDocument>;
  updateStatus(
    id: string,
    status: DisputeStatus,
    resolution?: string,
  ): Promise<IDisputeDocument | null>;
}
