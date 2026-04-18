import mongoose from 'mongoose';
import { NotificationModel } from '../models/NotificationModel';
import { eventBus, OutcomeConfirmedPayload, DisputeResolvedPayload } from './EventBus';

// Phase 7 — NotificationService registers independent listeners on EventBus (Observer pattern)
// It does NOT receive any direct calls from ApplicationService or DisputeService

export class NotificationService {
  constructor() {
    // Register as observer — listens to outcome.confirmed events independently
    eventBus.on('outcome.confirmed', async (payload: OutcomeConfirmedPayload) => {
      await this.handleOutcomeConfirmed(payload);
    });

    // Register as observer — listens to dispute.resolved events independently
    eventBus.on('dispute.resolved', async (payload: DisputeResolvedPayload) => {
      await this.handleDisputeResolved(payload);
    });
  }

  private async handleOutcomeConfirmed(payload: OutcomeConfirmedPayload): Promise<void> {
    try {
      // In a full implementation, we'd look up the worker's userId to send to
      // For now we log to the notifications collection using workerId as a proxy
      await new NotificationModel({
        userId: new mongoose.Types.ObjectId(payload.workerId),
        message: `Your work outcome has been recorded: ${payload.outcome}`,
        type: 'OUTCOME',
        read: false,
      }).save();
    } catch (error) {
      console.error('[NotificationService] Error handling outcome.confirmed:', error);
    }
  }

  private async handleDisputeResolved(payload: DisputeResolvedPayload): Promise<void> {
    try {
      const message =
        payload.resolution === 'WORKER_FAVOUR'
          ? 'Your dispute was resolved in your favour.'
          : 'Your dispute was resolved against you.';

      await new NotificationModel({
        userId: new mongoose.Types.ObjectId(payload.workerId),
        message,
        type: 'DISPUTE',
        read: false,
      }).save();
    } catch (error) {
      console.error('[NotificationService] Error handling dispute.resolved:', error);
    }
  }
}
