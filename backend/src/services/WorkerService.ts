import mongoose from 'mongoose';
import { IWorkerRepository } from '../repositories/interfaces/IWorkerRepository';
import { IScoreRepository } from '../repositories/interfaces/IScoreRepository';
import { IEmployerRepository } from '../repositories/interfaces/IEmployerRepository';
import { ScoreTier } from '../types/enums';
import { AppError } from '../utils/StateMachine';
import { UserModel } from '../models/UserModel';

// Phase 7 — WorkerService handles worker profile creation and retrieval
export class WorkerService {
  private readonly workerRepo: IWorkerRepository;
  private readonly scoreRepo: IScoreRepository;
  private readonly employerRepo: IEmployerRepository;

  constructor(
    workerRepo: IWorkerRepository,
    scoreRepo: IScoreRepository,
    employerRepo: IEmployerRepository,
  ) {
    this.workerRepo = workerRepo;
    this.scoreRepo = scoreRepo;
    this.employerRepo = employerRepo;
  }

  public async createProfile(userId: string, skills: string[]) {
    const existing = await this.workerRepo.findByUserId(userId);
    if (existing) throw new AppError('Worker profile already exists', 409);

    return this.workerRepo.create({
      userId: new mongoose.Types.ObjectId(userId),
      skills,
    });
  }

  // userId = the User document _id (from JWT — same value in URL param)
  public async getProfile(userId: string) {
    const worker = await this.workerRepo.findByUserId(userId);
    if (!worker) throw new AppError('Worker profile not found', 404);

    const user = await UserModel.findById(userId).exec();
    const workerId = (worker._id as mongoose.Types.ObjectId).toString();
    const scoreEvents = await this.scoreRepo.findByWorkerId(workerId);
    const tier = this.computeTier(worker.trustScore);

    return {
      workerId,
      email: user?.email,
      skills: worker.skills,
      verified: worker.verified,
      trustScore: worker.trustScore,
      tier,
      scoreHistory: scoreEvents,
    };
  }

  public async getScore(userId: string) {
    const worker = await this.workerRepo.findByUserId(userId);
    if (!worker) throw new AppError('Worker profile not found', 404);

    const workerId = (worker._id as mongoose.Types.ObjectId).toString();
    const tier = this.computeTier(worker.trustScore);
    const history = await this.scoreRepo.findByWorkerId(workerId);

    return {
      score: worker.trustScore,
      tier,
      history,
    };
  }

  private computeTier(score: number): ScoreTier {
    if (score <= 30) return ScoreTier.UNVERIFIED;
    if (score <= 50) return ScoreTier.NEW;
    if (score <= 70) return ScoreTier.RELIABLE;
    if (score <= 85) return ScoreTier.TRUSTED;
    return ScoreTier.ELITE;
  }
}
