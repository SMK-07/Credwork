import mongoose from 'mongoose';
import { IJobDocument, JobModel } from '../../models/JobModel';
import { IJobRepository } from '../interfaces/IJobRepository';
import { JobStatus } from '../../types/enums';

export class MongoJobRepository implements IJobRepository {
  public async findById(id: string): Promise<IJobDocument | null> {
    return JobModel.findById(id).exec();
  }

  public async findAllOpen(): Promise<IJobDocument[]> {
    return JobModel.find({ status: JobStatus.OPEN }).exec();
  }

  public async findByEmployerId(employerId: string): Promise<IJobDocument[]> {
    return JobModel.find({
      employerId: new mongoose.Types.ObjectId(employerId),
    }).exec();
  }

  public async findBySkill(skill: string): Promise<IJobDocument[]> {
    return JobModel.find({
      status: JobStatus.OPEN,
      requiredSkills: { $in: [skill] },
    }).exec();
  }

  public async create(data: {
    employerId: mongoose.Types.ObjectId;
    title: string;
    description: string;
    requiredSkills: string[];
  }): Promise<IJobDocument> {
    const job = new JobModel({
      employerId: data.employerId,
      title: data.title,
      description: data.description,
      requiredSkills: data.requiredSkills,
      status: JobStatus.OPEN,
    });
    return job.save();
  }

  public async updateStatus(
    id: string,
    status: JobStatus,
    assignedWorkerId?: mongoose.Types.ObjectId,
  ): Promise<IJobDocument | null> {
    const updateData: Partial<IJobDocument> = { status };
    if (assignedWorkerId) {
      updateData.assignedWorkerId = assignedWorkerId;
    }
    return JobModel.findByIdAndUpdate(id, { $set: updateData }, { new: true }).exec();
  }
}
