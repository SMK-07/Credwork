import { JobStatus, ApplicationStatus } from '../types/enums';

// Phase 5 — State Machine utility class
// Enforces valid transitions for Job and Application state machines.
// Throws AppError with 400 status on invalid transition — never silently allows them.

type ValidTransitionMap = Map<string, string[]>;

export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class StateMachine {
  private readonly validTransitions: ValidTransitionMap;

  constructor() {
    this.validTransitions = new Map<string, string[]>();
    this.registerJobTransitions();
    this.registerApplicationTransitions();
  }

  private registerJobTransitions(): void {
    this.validTransitions.set(JobStatus.OPEN, [JobStatus.ASSIGNED, JobStatus.CANCELLED]);
    this.validTransitions.set(JobStatus.ASSIGNED, [
      JobStatus.COMPLETED,
      JobStatus.CANCELLED,
    ]);
    this.validTransitions.set(JobStatus.COMPLETED, []);
    this.validTransitions.set(JobStatus.CANCELLED, []);
  }

  private registerApplicationTransitions(): void {
    this.validTransitions.set(ApplicationStatus.PENDING, [ApplicationStatus.ACCEPTED]);
    this.validTransitions.set(ApplicationStatus.ACCEPTED, [
      ApplicationStatus.OUTCOME_CONFIRMED,
      ApplicationStatus.GHOSTED,
    ]);
    this.validTransitions.set(ApplicationStatus.OUTCOME_CONFIRMED, []);
    this.validTransitions.set(ApplicationStatus.GHOSTED, []);
  }

  public validate(current: string, next: string): boolean {
    const allowed = this.validTransitions.get(current);
    if (!allowed) {
      return false;
    }
    return allowed.includes(next);
  }

  public transition(current: string, next: string): void {
    if (!this.validate(current, next)) {
      throw new AppError(
        `Invalid state transition: ${current} → ${next}. ` +
          `Allowed transitions from ${current}: [${this.validTransitions.get(current)?.join(', ') || 'none'}]`,
        400,
      );
    }
  }
}

// Export singleton instance used across all services
export const stateMachine = new StateMachine();
