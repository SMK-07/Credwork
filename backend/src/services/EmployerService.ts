import { IEmployerRepository } from '../repositories/interfaces/IEmployerRepository';
import { AppError } from '../utils/StateMachine';
import { UserModel } from '../models/UserModel';
import mongoose from 'mongoose';

export class EmployerService {
  private readonly employerRepo: IEmployerRepository;

  constructor(employerRepo: IEmployerRepository) {
    this.employerRepo = employerRepo;
  }

  public async createProfile(userId: string, orgName: string) {
    const existing = await this.employerRepo.findByUserId(userId);
    if (existing) throw new AppError('Employer profile already exists', 409);

    return this.employerRepo.create({
      userId: new mongoose.Types.ObjectId(userId),
      orgName,
    });
  }

  public async getProfile(employerId: string) {
    const employer = await this.employerRepo.findById(employerId);
    if (!employer) throw new AppError('Employer not found', 404);
    const user = await UserModel.findById(employer.userId).exec();
    return { ...employer.toObject(), email: user?.email };
  }
}
