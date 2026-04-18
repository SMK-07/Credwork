// Frontend type definitions matching backend enums

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

// API Response types
export interface AuthUser {
  userId: string;
  role: UserRole;
  token: string;
}

export interface WorkerProfile {
  workerId: string;
  email?: string;
  skills: string[];
  verified: boolean;
  trustScore: number;
  tier: ScoreTier;
  scoreHistory: ScoreEvent[];
}

export interface ScoreData {
  score: number;
  tier: ScoreTier;
  history: ScoreEvent[];
}

export interface ScoreEvent {
  _id: string;
  eventType: ScoreEventType;
  delta: number;
  scoreBefore: number;
  scoreAfter: number;
  reason: string;
  createdAt: string;
}

export interface Job {
  _id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  status: JobStatus;
  employerId: string;
  assignedWorkerId?: string;
  createdAt: string;
}

export interface Application {
  _id: string;
  workerId: string;
  jobId: string;
  status: ApplicationStatus;
  outcome?: OutcomeType;
  appliedAt: string;
}

export interface Dispute {
  _id: string;
  applicationId: string;
  raisedBy: string;
  raisedByRole: string;
  description: string;
  status: DisputeStatus;
  resolution?: string;
  createdAt: string;
}

export interface Verification {
  _id: string;
  workerId: string;
  docType: string;
  docPath: string;
  status: VerificationStatus;
  adminNote?: string;
  createdAt: string;
}
