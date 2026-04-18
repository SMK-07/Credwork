import mongoose from 'mongoose';
import { IEmployerDocument } from '../../models/EmployerModel';

export interface IEmployerRepository {
  findById(id: string): Promise<IEmployerDocument | null>;
  findByUserId(userId: string): Promise<IEmployerDocument | null>;
  create(data: {
    userId: mongoose.Types.ObjectId;
    orgName: string;
  }): Promise<IEmployerDocument>;
  findAll(): Promise<IEmployerDocument[]>;
}
