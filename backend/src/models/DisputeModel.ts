import mongoose, { Document, Schema } from 'mongoose';
import { DisputeStatus } from '../types/enums';

export interface IDisputeDocument extends Document {
  applicationId: mongoose.Types.ObjectId;
  raisedBy: mongoose.Types.ObjectId;
  raisedByRole: string;
  description: string;
  status: DisputeStatus;
  resolution?: string;
  resolvedAt: Date | null;
  createdAt: Date;
}

const DisputeSchema = new Schema<IDisputeDocument>(
  {
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
    },
    raisedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    raisedByRole: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(DisputeStatus),
      default: DisputeStatus.OPEN,
      index: true,
    },
    resolution: {
      type: String,
      default: '',
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false, versionKey: false },
);

export const DisputeModel = mongoose.model<IDisputeDocument>(
  'Dispute',
  DisputeSchema,
  'disputes',
);
