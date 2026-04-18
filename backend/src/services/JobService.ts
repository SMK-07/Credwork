import mongoose from 'mongoose';
import { IJobRepository } from '../repositories/interfaces/IJobRepository';
import { IWorkerRepository } from '../repositories/interfaces/IWorkerRepository';
import { IEmployerRepository } from '../repositories/interfaces/IEmployerRepository';
import { JobStatus } from '../types/enums';
import { stateMachine, AppError } from '../utils/StateMachine';

// Phase 7 — JobService handles job lifecycle, assignment and state transitions
export class JobService {
  private readonly jobRepo: IJobRepository;
  private readonly workerRepo: IWorkerRepository;
  private readonly employerRepo: IEmployerRepository;

  constructor(
    jobRepo: IJobRepository,
    workerRepo: IWorkerRepository,
    employerRepo: IEmployerRepository,
  ) {
    this.jobRepo = jobRepo;
    this.workerRepo = workerRepo;
    this.employerRepo = employerRepo;
  }

  public async postJob(
    userId: string,
    data: { title: string; description: string; requiredSkills: string[] },
  ) {
    const employer = await this.employerRepo.findByUserId(userId);
    if (!employer) throw new AppError('Employer profile not found', 404);

    return this.jobRepo.create({
      employerId: employer._id as mongoose.Types.ObjectId,
      ...data,
    });
  }

  public async listOpenJobs(skillFilter?: string) {
    if (skillFilter) {
      return this.jobRepo.findBySkill(skillFilter);
    }
    return this.jobRepo.findAllOpen();
  }

  public async getJobById(id: string) {
    const job = await this.jobRepo.findById(id);
    if (!job) throw new AppError('Job not found', 404);
    return job;
  }

  public async getEmployerJobs(userId: string) {
    const employer = await this.employerRepo.findByUserId(userId);
    if (!employer) throw new AppError('Employer profile not found', 404);
    return this.jobRepo.findByEmployerId(
      (employer._id as mongoose.Types.ObjectId).toString(),
    );
  }

  // Assign a worker to a job — validates OPEN → ASSIGNED transition via StateMachine
  public async assignWorker(jobId: string, workerId: string) {
    const job = await this.jobRepo.findById(jobId);
    if (!job) throw new AppError('Job not found', 404);

    const worker = await this.workerRepo.findById(workerId);
    if (!worker) throw new AppError('Worker not found', 404);

    // StateMachine guard — throws 400 AppError on invalid transition
    stateMachine.transition(job.status, JobStatus.ASSIGNED);

    return this.jobRepo.updateStatus(
      jobId,
      JobStatus.ASSIGNED,
      worker._id as mongoose.Types.ObjectId,
    );
  }

  public async cancelJob(jobId: string) {
    const job = await this.jobRepo.findById(jobId);
    if (!job) throw new AppError('Job not found', 404);
    stateMachine.transition(job.status, JobStatus.CANCELLED);
    return this.jobRepo.updateStatus(jobId, JobStatus.CANCELLED);
  }

  public async completeJob(jobId: string) {
    const job = await this.jobRepo.findById(jobId);
    if (!job) throw new AppError('Job not found', 404);
    stateMachine.transition(job.status, JobStatus.COMPLETED);
    return this.jobRepo.updateStatus(jobId, JobStatus.COMPLETED);
  }
}
