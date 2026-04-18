import mongoose, { Document, Schema } from 'mongoose';
import { VerificationStatus } from '../types/enums';

export interface IVerificationDocument extends Document {
  workerId: mongoose.Types.ObjectId;
  docType: string;
  docPath: string;
  status: VerificationStatus;
  adminNote?: string;
  verifiedAt: Date | null;
  createdAt: Date;
}

const VerificationSchema = new Schema<IVerificationDocument>(
  {
    workerId: {
      type: Schema.Types.ObjectId,
      ref: 'Worker',
      required: true,
    },
    docType: {
      type: String,
      required: true,
    },
    docPath: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(VerificationStatus),
      default: VerificationStatus.PENDING,
    },
    adminNote: {
      type: String,
      default: '',
    },
    verifiedAt: {
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

export const VerificationModel = mongoose.model<IVerificationDocument>(
  'Verification',
  VerificationSchema,
  'verifications',
);
