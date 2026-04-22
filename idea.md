# Credwork — Trust Score Engine for the Informal Labour Market

## Problem Statement

The informal labour market (gig workers, daily wage workers, domestic helpers, freelancers) lacks a reliable way to establish trust between workers and employers. Workers have no verifiable track record, and employers have no objective signal of reliability. This leads to:

- Employers over-relying on personal referrals
- Workers ghosting jobs with no consequence
- No incentive structure for consistent, quality work
- No recourse for disputes

## Solution

**Credwork** is a marketplace platform with an embedded trust score engine. Every worker carries a dynamic trust score (0–100) that is updated based on verified work outcomes. Employers post jobs, workers apply, and the outcome of each engagement directly affects the worker's public trust score.

## Core Value Proposition

| Actor | Value |
|-------|-------|
| **Worker** | Build a verifiable work reputation over time; higher score = better job opportunities |
| **Employer** | Hire workers with an objective, tamper-resistant reliability signal |
| **Admin** | Maintain marketplace integrity through ID verification and dispute resolution |

## Key Features

### 1. Role-Based User System
- **Worker** — Applies for jobs, earns/loses trust score, raises disputes
- **Employer** — Posts jobs, assigns workers, records outcomes
- **Admin** — Approves ID verifications, resolves disputes

### 2. Trust Score Engine
- Initial score: **50** (NEW tier)
- Score range: **0–100**
- Score changes are atomic and logged in a permanent audit trail (`ScoreEvent`)
- Score tiers reflect reliability:

| Tier | Score Range |
|------|-------------|
| UNVERIFIED | 0–30 |
| NEW | 31–50 |
| RELIABLE | 51–70 |
| TRUSTED | 71–85 |
| ELITE | 86–100 |

### 3. Score Events
| Outcome | Delta |
|---------|-------|
| Work Confirmed (employer) | +5 |
| Work Rejected (employer) | −3 |
| Ghost (no-show) | −8 |
| Dispute Won (admin ruling) | +4 |
| Dispute Lost (admin ruling) | −6 |

### 4. Job Lifecycle
```
OPEN → ASSIGNED → COMPLETED / CANCELLED
```
Applications follow a parallel state machine:
```
PENDING → ACCEPTED → OUTCOME_CONFIRMED / GHOSTED
```

### 5. ID Verification
Workers can upload identity documents. Admin approval marks the worker as `verified`, raising their credibility and enabling access to restricted job postings.

### 6. Dispute Resolution
Either party can raise a dispute after a job outcome. Admin reviews and assigns blame:
- **WORKER_FAVOUR** → +4 to worker score
- **WORKER_FAULT** → −6 to worker score

### 7. Notifications
Workers receive in-app notifications when outcomes are confirmed or disputes are resolved, keeping them informed of score changes.

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18.2 + TypeScript + Vite |
| Backend | Node.js + Express + TypeScript |
| Database | MongoDB Atlas (Mongoose ODM) |
| Auth | JWT (7-day expiry) + bcryptjs |
| File Storage | Server-side `/uploads` directory (multer) |
| Deployment | Render (backend), Vercel-compatible (frontend) |

## Architectural Patterns

- **Repository Pattern** — Decouples services from MongoDB
- **Observer Pattern (EventBus)** — Services communicate via events, never direct calls
- **Strategy Pattern** — Pluggable scoring strategies (standard vs. reasoning-aware)
- **State Machine** — Enforces valid Job and Application status transitions
- **Singleton Pattern** — Shared DB connection, EventBus, and API client

## Design Goals

1. **Fairness** — Score changes are based on employer-recorded outcomes; disputes provide a worker recourse mechanism
2. **Transparency** — Every score change is logged with reason, delta, before/after values
3. **Integrity** — Admin-gated verification and dispute resolution prevent gaming
4. **Extensibility** — Strategy pattern allows new scoring rules without touching core logic
