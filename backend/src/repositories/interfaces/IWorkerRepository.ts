import mongoose from 'mongoose';
import { IWorkerDocument } from '../../models/WorkerModel';

// Phase 4 — Repository interface for Worker collection
// Services depend on this interface, NOT on Mongoose directly (Dependency Inversion)
export interface IWorkerRepository {
  findById(id: string): Promise<IWorkerDocument | null>;
  findByUserId(userId: string): Promise<IWorkerDocument | null>;
  create(data: {
    userId: mongoose.Types.ObjectId;
    skills: string[];
  }): Promise<IWorkerDocument>;
  update(id: string, data: Partial<IWorkerDocument>): Promise<IWorkerDocument | null>;
  updateTrustScore(
    id: string,
    score: number,
    session?: mongoose.ClientSession,
  ): Promise<IWorkerDocument | null>;
  findAll(): Promise<IWorkerDocument[]>;
}
