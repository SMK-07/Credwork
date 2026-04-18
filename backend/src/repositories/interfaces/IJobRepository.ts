import mongoose from 'mongoose';
import { IJobDocument } from '../../models/JobModel';
import { JobStatus } from '../../types/enums';

export interface IJobRepository {
  findById(id: string): Promise<IJobDocument | null>;
  findAllOpen(): Promise<IJobDocument[]>;
  findByEmployerId(employerId: string): Promise<IJobDocument[]>;
  findBySkill(skill: string): Promise<IJobDocument[]>;
  create(data: {
    employerId: mongoose.Types.ObjectId;
    title: string;
    description: string;
    requiredSkills: string[];
  }): Promise<IJobDocument>;
  updateStatus(
    id: string,
    status: JobStatus,
    assignedWorkerId?: mongoose.Types.ObjectId,
  ): Promise<IJobDocument | null>;
}
