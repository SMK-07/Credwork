import mongoose from 'mongoose';
import { IDisputeDocument, DisputeModel } from '../../models/DisputeModel';
import { IDisputeRepository } from '../interfaces/IDisputeRepository';
import { DisputeStatus } from '../../types/enums';

export class MongoDisputeRepository implements IDisputeRepository {
  public async findById(id: string): Promise<IDisputeDocument | null> {
    return DisputeModel.findById(id).exec();
  }

  public async findAllOpen(): Promise<IDisputeDocument[]> {
    return DisputeModel.find({ status: DisputeStatus.OPEN }).exec();
  }

  public async findAll(): Promise<IDisputeDocument[]> {
    return DisputeModel.find().exec();
  }

  public async create(data: {
    applicationId: mongoose.Types.ObjectId;
    raisedBy: mongoose.Types.ObjectId;
    raisedByRole: string;
    description: string;
  }): Promise<IDisputeDocument> {
    const dispute = new DisputeModel({
      ...data,
      status: DisputeStatus.OPEN,
      resolvedAt: null,
    });
    return dispute.save();
  }

  public async updateStatus(
    id: string,
    status: DisputeStatus,
    resolution?: string,
  ): Promise<IDisputeDocument | null> {
    const update: Partial<IDisputeDocument> = { status };
    if (resolution) {
      update.resolution = resolution;
    }
    if (status === DisputeStatus.RESOLVED) {
      update.resolvedAt = new Date();
    }
    return DisputeModel.findByIdAndUpdate(id, { $set: update }, { new: true }).exec();
  }
}
