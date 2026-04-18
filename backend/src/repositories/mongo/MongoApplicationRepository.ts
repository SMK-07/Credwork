import mongoose from 'mongoose';
import { IApplicationDocument, ApplicationModel } from '../../models/ApplicationModel';
import { IApplicationRepository } from '../interfaces/IApplicationRepository';
import { ApplicationStatus, OutcomeType } from '../../types/enums';

export class MongoApplicationRepository implements IApplicationRepository {
  public async findById(id: string): Promise<IApplicationDocument | null> {
    return ApplicationModel.findById(id).exec();
  }

  public async findByWorkerId(workerId: string): Promise<IApplicationDocument[]> {
    return ApplicationModel.find({
      workerId: new mongoose.Types.ObjectId(workerId),
    }).exec();
  }

  public async findByJobId(jobId: string): Promise<IApplicationDocument[]> {
    return ApplicationModel.find({
      jobId: new mongoose.Types.ObjectId(jobId),
    }).exec();
  }

  public async findByWorkerAndJob(
    workerId: string,
    jobId: string,
  ): Promise<IApplicationDocument | null> {
    return ApplicationModel.findOne({
      workerId: new mongoose.Types.ObjectId(workerId),
      jobId: new mongoose.Types.ObjectId(jobId),
    }).exec();
  }

  public async create(data: {
    workerId: mongoose.Types.ObjectId;
    jobId: mongoose.Types.ObjectId;
  }): Promise<IApplicationDocument> {
    const app = new ApplicationModel({
      workerId: data.workerId,
      jobId: data.jobId,
      status: ApplicationStatus.PENDING,
      outcome: null,
    });
    return app.save();
  }

  public async updateStatus(
    id: string,
    status: ApplicationStatus,
  ): Promise<IApplicationDocument | null> {
    return ApplicationModel.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true },
    ).exec();
  }

  public async updateOutcome(
    id: string,
    outcome: OutcomeType,
    reason: string,
    status: ApplicationStatus,
  ): Promise<IApplicationDocument | null> {
    return ApplicationModel.findByIdAndUpdate(
      id,
      { $set: { outcome, outcomeReason: reason, status } },
      { new: true },
    ).exec();
  }
}
