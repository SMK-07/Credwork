import mongoose from 'mongoose';
import { IWorkerDocument, WorkerModel } from '../../models/WorkerModel';
import { IWorkerRepository } from '../interfaces/IWorkerRepository';

// Phase 4  Concrete Mongoose implementation of IWorkerRepository
export class MongoWorkerRepository implements IWorkerRepository {
  public async findById(id: string): Promise<IWorkerDocument | null> {
    return WorkerModel.findById(id).exec();
  }

  public async findByUserId(userId: string): Promise<IWorkerDocument | null> {
    return WorkerModel.findOne({ userId: new mongoose.Types.ObjectId(userId) }).exec();
  }

  public async create(data: {
    userId: mongoose.Types.ObjectId;
    skills: string[];
  }): Promise<IWorkerDocument> {
    const worker = new WorkerModel({
      userId: data.userId,
      skills: data.skills,
      verified: false,
      trustScore: 50.0,
    });
    return worker.save();
  }

  public async update(
    id: string,
    data: Partial<IWorkerDocument>,
  ): Promise<IWorkerDocument | null> {
    return WorkerModel.findByIdAndUpdate(id, { $set: data }, { new: true }).exec();
  }

  public async updateTrustScore(
    id: string,
    score: number,
    session?: mongoose.ClientSession,
  ): Promise<IWorkerDocument | null> {
    const options = session ? { new: true, session } : { new: true };
    return WorkerModel.findByIdAndUpdate(id, { $set: { trustScore: score } }, options).exec();
  }

  public async findAll(): Promise<IWorkerDocument[]> {
    return WorkerModel.find().exec();
  }
}
