import mongoose from 'mongoose';
import { IScoreRepository } from '../repositories/interfaces/IScoreRepository';
import { IWorkerRepository } from '../repositories/interfaces/IWorkerRepository';
import { ScoringStrategy } from './scoring/ScoringStrategy';
import { StandardScoring } from './scoring/StandardScoring';
import { ReasoningProtocol } from './scoring/ReasoningProtocol';
import { OutcomeType, ScoreTier } from '../types/enums';
import { eventBus, OutcomeConfirmedPayload, DisputeResolvedPayload } from './EventBus';

// Phase 6 & 7  TrustScoreService
// - Uses Strategy pattern to select between StandardScoring and ReasoningProtocol
// - Listens to EventBus events (Observer pattern)  never called directly by ApplicationService
// - All score updates are atomic via MongoDB session

export class TrustScoreService {
  private readonly scoreRepo: IScoreRepository;
  private readonly workerRepo: IWorkerRepository;

  constructor(scoreRepo: IScoreRepository, workerRepo: IWorkerRepository) {
    this.scoreRepo = scoreRepo;
    this.workerRepo = workerRepo;

    // Phase 7  Register as observer on EventBus
    // TrustScoreService listens for outcome.confirmed events independently
    eventBus.on('outcome.confirmed', async (payload: OutcomeConfirmedPayload) => {
      await this.handleOutcomeConfirmed(payload);
    });

    // Listen for dispute resolution events
    eventBus.on('dispute.resolved', async (payload: DisputeResolvedPayload) => {
      await this.handleDisputeResolved(payload);
    });
  }

  // Strategy Pattern  selects strategy at runtime based on presence of reason
  public selectStrategy(reason?: string): ScoringStrategy {
    if (reason && reason.trim().length > 0) {
      return new ReasoningProtocol();
    }
    return new StandardScoring();
  }

  // Compute tier from score
  public computeTier(score: number): ScoreTier {
    if (score <= 30) return ScoreTier.UNVERIFIED;
    if (score <= 50) return ScoreTier.NEW;
    if (score <= 70) return ScoreTier.RELIABLE;
    if (score <= 85) return ScoreTier.TRUSTED;
    return ScoreTier.ELITE;
  }

  // Clamp score between floor and ceiling
  private clampScore(score: number): number {
    return Math.min(100.0, Math.max(0.0, score));
  }

  // Core method  atomic score update via MongoDB session
  public async computeAndApply(
    workerId: string,
    applicationId: string,
    outcomeKey: string,
    reason?: string,
  ): Promise<void> {
    const worker = await this.workerRepo.findById(workerId);
    if (!worker) {
      throw new Error(`Worker not found: ${workerId}`);
    }

    const strategy = this.selectStrategy(reason);
    const delta = strategy.computeDelta(outcomeKey, reason);
    const eventType = strategy.mapToEventType(outcomeKey);
    const scoreBefore = worker.trustScore;
    const scoreAfter = this.clampScore(scoreBefore + delta);

    // Atomic: insert ScoreEvent + update workers.trustScore in same MongoDB session
    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      await this.scoreRepo.createEvent(
        {
          workerId: new mongoose.Types.ObjectId(workerId),
          applicationId: new mongoose.Types.ObjectId(applicationId),
          eventType,
          delta,
          scoreBefore,
          scoreAfter,
          reason: reason ?? '',
        },
        session,
      );

      await this.scoreRepo.updateWorkerScore(workerId, scoreAfter, session);

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // Observer handler  called when outcome.confirmed event fires
  private async handleOutcomeConfirmed(payload: OutcomeConfirmedPayload): Promise<void> {
    try {
      await this.computeAndApply(
        payload.workerId,
        payload.applicationId,
        payload.outcome,
        payload.reason,
      );
    } catch (error) {
      console.error('[TrustScoreService] Error handling outcome.confirmed:', error);
    }
  }

  // Observer handler  called when dispute.resolved event fires
  private async handleDisputeResolved(payload: DisputeResolvedPayload): Promise<void> {
    try {
      // WORKER_FAVOUR † DISPUTE_WON (+4), WORKER_FAULT † DISPUTE_LOST (-6)
      const outcomeKey =
        payload.resolution === 'WORKER_FAVOUR' ? 'DISPUTE_WON' : 'DISPUTE_LOST';
      await this.computeAndApply(
        payload.workerId,
        payload.applicationId,
        outcomeKey,
        payload.description,
      );
    } catch (error) {
      console.error('[TrustScoreService] Error handling dispute.resolved:', error);
    }
  }
}
