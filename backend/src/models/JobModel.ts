import mongoose, { Document, Schema } from 'mongoose';
import { JobStatus } from '../types/enums';

export interface IJobDocument extends Document {
  employerId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  requiredSkills: string[];
  status: JobStatus;
  assignedWorkerId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const JobSchema = new Schema<IJobDocument>(
  {
    employerId: {
      type: Schema.Types.ObjectId,
      ref: 'Employer',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    requiredSkills: {
      type: [String],
      default: [],
      index: true, // multikey index for skill-based search
    },
    status: {
      type: String,
      enum: Object.values(JobStatus),
      default: JobStatus.OPEN,
      index: true,
    },
    assignedWorkerId: {
      type: Schema.Types.ObjectId,
      ref: 'Worker',
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false, versionKey: false },
);

export const JobModel = mongoose.model<IJobDocument>('Job', JobSchema, 'jobs');
