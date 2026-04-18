import mongoose from 'mongoose';
import { IScoreEventDocument, ScoreEventModel } from '../../models/ScoreEventModel';
import { IScoreRepository } from '../interfaces/IScoreRepository';
import { ScoreEventType } from '../../types/enums';
import { WorkerModel } from '../../models/WorkerModel';

export class MongoScoreRepository implements IScoreRepository {
  public async createEvent(
    data: {
      workerId: mongoose.Types.ObjectId;
      applicationId: mongoose.Types.ObjectId;
      eventType: ScoreEventType;
      delta: number;
      scoreBefore: number;
      scoreAfter: number;
      reason: string;
    },
    session?: mongoose.ClientSession,
  ): Promise<IScoreEventDocument> {
    const event = new ScoreEventModel(data);
    return session ? event.save({ session }) : event.save();
  }

  public async findByWorkerId(workerId: string): Promise<IScoreEventDocument[]> {
    return ScoreEventModel.find({
      workerId: new mongoose.Types.ObjectId(workerId),
    })
      .sort({ createdAt: -1 })
      .exec();
  }

  public async updateWorkerScore(
    workerId: string,
    newScore: number,
    session?: mongoose.ClientSession,
  ): Promise<void> {
    const options = session ? { new: true, session } : { new: true };
    await WorkerModel.findByIdAndUpdate(
      workerId,
      { $set: { trustScore: newScore } },
      options,
    ).exec();
  }
}
