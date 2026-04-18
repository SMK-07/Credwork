import mongoose, { Document, Schema } from 'mongoose';

export interface IEmployerDocument extends Document {
  userId: mongoose.Types.ObjectId;
  orgName: string;
  verified: boolean;
  createdAt: Date;
}

const EmployerSchema = new Schema<IEmployerDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    orgName: {
      type: String,
      required: true,
      trim: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false, versionKey: false },
);

export const EmployerModel = mongoose.model<IEmployerDocument>(
  'Employer',
  EmployerSchema,
  'employers',
);
