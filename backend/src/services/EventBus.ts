import { EventEmitter } from 'events';
import { OutcomeType } from '../types/enums';

// Phase 5 — EventBus extends Node.js EventEmitter (Observer pattern)
// ApplicationService emits events; TrustScoreService and NotificationService listen independently.
// Services NEVER call each other directly — all communication goes through EventBus.

export interface OutcomeConfirmedPayload {
  workerId: string;
  applicationId: string;
  outcome: OutcomeType;
  reason?: string;
}

export interface DisputeResolvedPayload {
  workerId: string;
  applicationId: string;
  resolution: string; // 'WORKER_FAVOUR' | 'WORKER_FAULT'
  description?: string;
}

export type EventBusEvents = {
  'outcome.confirmed': [OutcomeConfirmedPayload];
  'dispute.resolved': [DisputeResolvedPayload];
};

class EventBus extends EventEmitter {
  private static instance: EventBus;

  private constructor() {
    super();
    this.setMaxListeners(20);
  }

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }
}

// Singleton — exported for use in services
export const eventBus = EventBus.getInstance();
