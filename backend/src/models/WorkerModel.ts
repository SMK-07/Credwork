import mongoose, { Document, Schema } from 'mongoose';
import { ScoreTier } from '../types/enums';

export interface IWorkerDocument extends Document {
  userId: mongoose.Types.ObjectId;
  skills: string[];
  verified: boolean;
  trustScore: number;
  createdAt: Date;
}

const WorkerSchema = new Schema<IWorkerDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    verified: {
      type: Boolean,
      default: false,
    },
    trustScore: {
      type: Number,
      default: 50.0,
      min: 0,
      max: 100,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false, versionKey: false },
);

// Utility  compute tier from trust score
WorkerSchema.methods.computeTier = function (): ScoreTier {
  const score: number = this.trustScore;
  if (score <= 30) return ScoreTier.UNVERIFIED;
  if (score <= 50) return ScoreTier.NEW;
  if (score <= 70) return ScoreTier.RELIABLE;
  if (score <= 85) return ScoreTier.TRUSTED;
  return ScoreTier.ELITE;
};

export const WorkerModel = mongoose.model<IWorkerDocument>('Worker', WorkerSchema, 'workers');
