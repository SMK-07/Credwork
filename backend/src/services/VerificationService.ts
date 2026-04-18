import mongoose from 'mongoose';
import { IVerificationRepository } from '../repositories/interfaces/IVerificationRepository';
import { IWorkerRepository } from '../repositories/interfaces/IWorkerRepository';
import { VerificationStatus } from '../types/enums';
import { AppError } from '../utils/StateMachine';

// Phase 7 — VerificationService handles upload, review and approval of ID documents
export class VerificationService {
  private readonly verificationRepo: IVerificationRepository;
  private readonly workerRepo: IWorkerRepository;

  constructor(verificationRepo: IVerificationRepository, workerRepo: IWorkerRepository) {
    this.verificationRepo = verificationRepo;
    this.workerRepo = workerRepo;
  }

  public async submitVerification(
    userId: string,
    docType: string,
    docPath: string,
  ): Promise<{ verificationId: string }> {
    const worker = await this.workerRepo.findByUserId(userId);
    if (!worker) throw new AppError('Worker profile not found', 404);

    const verification = await this.verificationRepo.create({
      workerId: worker._id as mongoose.Types.ObjectId,
      docType,
      docPath,
    });

    return {
      verificationId: (verification._id as mongoose.Types.ObjectId).toString(),
    };
  }

  public async getPendingVerifications() {
    return this.verificationRepo.findAllPending();
  }

  public async approveVerification(verificationId: string, adminNote?: string) {
    const verification = await this.verificationRepo.findById(verificationId);
    if (!verification) throw new AppError('Verification not found', 404);
    if (verification.status !== VerificationStatus.PENDING) {
      throw new AppError('Verification is not in PENDING status', 400);
    }

    await this.verificationRepo.updateStatus(
      verificationId,
      VerificationStatus.APPROVED,
      adminNote,
    );

    // Set worker.verified = true
    await this.workerRepo.update(verification.workerId.toString(), { verified: true });

    return { success: true, message: 'Verification approved' };
  }

  public async rejectVerification(verificationId: string, adminNote?: string) {
    const verification = await this.verificationRepo.findById(verificationId);
    if (!verification) throw new AppError('Verification not found', 404);
    if (verification.status !== VerificationStatus.PENDING) {
      throw new AppError('Verification is not in PENDING status', 400);
    }

    await this.verificationRepo.updateStatus(
      verificationId,
      VerificationStatus.REJECTED,
      adminNote,
    );

    return { success: true, message: 'Verification rejected' };
  }
}
