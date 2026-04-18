import mongoose from 'mongoose';
import { IEmployerDocument, EmployerModel } from '../../models/EmployerModel';
import { IEmployerRepository } from '../interfaces/IEmployerRepository';

export class MongoEmployerRepository implements IEmployerRepository {
  public async findById(id: string): Promise<IEmployerDocument | null> {
    return EmployerModel.findById(id).exec();
  }

  public async findByUserId(userId: string): Promise<IEmployerDocument | null> {
    return EmployerModel.findOne({ userId: new mongoose.Types.ObjectId(userId) }).exec();
  }

  public async create(data: {
    userId: mongoose.Types.ObjectId;
    orgName: string;
  }): Promise<IEmployerDocument> {
    const employer = new EmployerModel({
      userId: data.userId,
      orgName: data.orgName,
      verified: false,
    });
    return employer.save();
  }

  public async findAll(): Promise<IEmployerDocument[]> {
    return EmployerModel.find().exec();
  }
}
