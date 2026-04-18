// Credwork  All TypeScript Enumerations

export enum UserRole {
  WORKER = 'WORKER',
  EMPLOYER = 'EMPLOYER',
  ADMIN = 'ADMIN',
}

export enum JobStatus {
  OPEN = 'OPEN',
  ASSIGNED = 'ASSIGNED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum ApplicationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  OUTCOME_CONFIRMED = 'OUTCOME_CONFIRMED',
  GHOSTED = 'GHOSTED',
}

export enum OutcomeType {
  CONFIRMED = 'CONFIRMED',
  REJECTED = 'REJECTED',
  GHOST = 'GHOST',
}

export enum DisputeStatus {
  OPEN = 'OPEN',
  UNDER_REVIEW = 'UNDER_REVIEW',
  RESOLVED = 'RESOLVED',
}

export enum VerificationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum ScoreTier {
  UNVERIFIED = 'UNVERIFIED',
  NEW = 'NEW',
  RELIABLE = 'RELIABLE',
  TRUSTED = 'TRUSTED',
  ELITE = 'ELITE',
}

export enum ScoreEventType {
  WORK_CONFIRMED = 'WORK_CONFIRMED',
  WORK_REJECTED = 'WORK_REJECTED',
  GHOST = 'GHOST',
  DISPUTE_WON = 'DISPUTE_WON',
  DISPUTE_LOST = 'DISPUTE_LOST',
}
