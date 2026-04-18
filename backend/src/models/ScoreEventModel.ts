import mongoose, { Document, Schema } from 'mongoose';
import { ScoreEventType } from '../types/enums';

export interface IScoreEventDocument extends Document {
  workerId: mongoose.Types.ObjectId;
  applicationId: mongoose.Types.ObjectId;
  eventType: ScoreEventType;
  delta: number;
  scoreBefore: number;
  scoreAfter: number;
  reason: string;
  createdAt: Date;
}

const ScoreEventSchema = new Schema<IScoreEventDocument>(
  {
    workerId: {
      type: Schema.Types.ObjectId,
      ref: 'Worker',
      required: true,
      index: true, // fast lookup of all events for a worker
    },
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
    },
    eventType: {
      type: String,
      enum: Object.values(ScoreEventType),
      required: true,
    },
    delta: {
      type: Number,
      required: true,
    },
    scoreBefore: {
      type: Number,
      required: true,
    },
    scoreAfter: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      default: '',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false, versionKey: false },
);

export const ScoreEventModel = mongoose.model<IScoreEventDocument>(
  'ScoreEvent',
  ScoreEventSchema,
  'scoreevents',
);
