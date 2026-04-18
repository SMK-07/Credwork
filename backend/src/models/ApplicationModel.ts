import mongoose, { Document, Schema } from 'mongoose';
import { ApplicationStatus, OutcomeType } from '../types/enums';

export interface IApplicationDocument extends Document {
  workerId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  status: ApplicationStatus;
  outcome: OutcomeType | null;
  outcomeReason?: string;
  appliedAt: Date;
}

const ApplicationSchema = new Schema<IApplicationDocument>(
  {
    workerId: {
      type: Schema.Types.ObjectId,
      ref: 'Worker',
      required: true,
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(ApplicationStatus),
      default: ApplicationStatus.PENDING,
    },
    outcome: {
      type: String,
      enum: [...Object.values(OutcomeType), null],
      default: null,
    },
    outcomeReason: {
      type: String,
      default: '',
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false, versionKey: false },
);

// Compound unique index — one application per worker per job
ApplicationSchema.index({ workerId: 1, jobId: 1 }, { unique: true });

export const ApplicationModel = mongoose.model<IApplicationDocument>(
  'Application',
  ApplicationSchema,
  'applications',
);
