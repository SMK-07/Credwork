import mongoose from 'mongoose';
import { IVerificationDocument, VerificationModel } from '../../models/VerificationModel';
import { IVerificationRepository } from '../interfaces/IVerificationRepository';
import { VerificationStatus } from '../../types/enums';

export class MongoVerificationRepository implements IVerificationRepository {
  public async findByWorkerId(workerId: string): Promise<IVerificationDocument[]> {
    return VerificationModel.find({
      workerId: new mongoose.Types.ObjectId(workerId),
    }).exec();
  }

  public async findAllPending(): Promise<IVerificationDocument[]> {
    return VerificationModel.find({ status: VerificationStatus.PENDING })
      .populate('workerId')
      .exec();
  }

  public async findById(id: string): Promise<IVerificationDocument | null> {
    return VerificationModel.findById(id).exec();
  }

  public async create(data: {
    workerId: mongoose.Types.ObjectId;
    docType: string;
    docPath: string;
  }): Promise<IVerificationDocument> {
    const verification = new VerificationModel({
      ...data,
      status: VerificationStatus.PENDING,
      verifiedAt: null,
    });
    return verification.save();
  }

  public async updateStatus(
    id: string,
    status: VerificationStatus,
    adminNote?: string,
  ): Promise<IVerificationDocument | null> {
    const update: Partial<IVerificationDocument> = { status };
    if (adminNote) update.adminNote = adminNote;
    if (status === VerificationStatus.APPROVED) {
      update.verifiedAt = new Date();
    }
    return VerificationModel.findByIdAndUpdate(id, { $set: update }, { new: true }).exec();
  }
}
