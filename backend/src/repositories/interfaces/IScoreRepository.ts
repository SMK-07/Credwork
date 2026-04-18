import mongoose from 'mongoose';
import { IScoreEventDocument } from '../../models/ScoreEventModel';
import { ScoreEventType } from '../../types/enums';

export interface IScoreRepository {
  createEvent(
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
  ): Promise<IScoreEventDocument>;
  findByWorkerId(workerId: string): Promise<IScoreEventDocument[]>;
  updateWorkerScore(
    workerId: string,
    newScore: number,
    session?: mongoose.ClientSession,
  ): Promise<void>;
}
