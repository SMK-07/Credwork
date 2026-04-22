# Entity-Relationship Diagram — Credwork

## Full ER Diagram

```mermaid
erDiagram

    USER {
        ObjectId _id PK
        String email UK
        String passwordHash
        String role "WORKER | EMPLOYER | ADMIN"
        Date createdAt
    }

    WORKER {
        ObjectId _id PK
        ObjectId userId FK
        String[] skills
        Boolean verified
        Number trustScore
        Date createdAt
    }

    EMPLOYER {
        ObjectId _id PK
        ObjectId userId FK
        String orgName
        Boolean verified
        Date createdAt
    }

    JOB {
        ObjectId _id PK
        ObjectId employerId FK
        String title
        String description
        String[] requiredSkills
        String status "OPEN | ASSIGNED | COMPLETED | CANCELLED"
        ObjectId assignedWorkerId FK
        Date createdAt
    }

    APPLICATION {
        ObjectId _id PK
        ObjectId workerId FK
        ObjectId jobId FK
        String status "PENDING | ACCEPTED | OUTCOME_CONFIRMED | GHOSTED"
        String outcome "CONFIRMED | REJECTED | GHOST"
        String outcomeReason
        Date appliedAt
    }

    DISPUTE {
        ObjectId _id PK
        ObjectId applicationId FK
        ObjectId raisedBy FK
        String raisedByRole "WORKER | EMPLOYER"
        String description
        String status "OPEN | UNDER_REVIEW | RESOLVED"
        String resolution "WORKER_FAVOUR | WORKER_FAULT"
        Date resolvedAt
        Date createdAt
    }

    VERIFICATION {
        ObjectId _id PK
        ObjectId workerId FK
        String docType
        String docPath
        String status "PENDING | APPROVED | REJECTED"
        String adminNote
        Date verifiedAt
        Date createdAt
    }

    SCORE_EVENT {
        ObjectId _id PK
        ObjectId workerId FK
        ObjectId applicationId FK
        String eventType "WORK_CONFIRMED | WORK_REJECTED | GHOST | DISPUTE_WON | DISPUTE_LOST"
        Number delta
        Number scoreBefore
        Number scoreAfter
        String reason
        Date createdAt
    }

    NOTIFICATION {
        ObjectId _id PK
        ObjectId userId FK
        String message
        String type
        Boolean read
        Date createdAt
    }

    USER ||--o| WORKER : "has profile"
    USER ||--o| EMPLOYER : "has profile"
    EMPLOYER ||--o{ JOB : "posts"
    JOB ||--o{ APPLICATION : "receives"
    WORKER ||--o{ APPLICATION : "submits"
    APPLICATION ||--o| DISPUTE : "triggers"
    USER ||--o{ DISPUTE : "raises"
    WORKER ||--o{ SCORE_EVENT : "accumulates"
    APPLICATION ||--o{ SCORE_EVENT : "references"
    WORKER ||--o{ VERIFICATION : "submits"
    USER ||--o{ NOTIFICATION : "receives"
    JOB }o--o| WORKER : "assigned to"
```

---

## Relationship Notes

| Relationship | Cardinality | Notes |
|---|---|---|
| USER → WORKER | 1:0..1 | Only if role = WORKER; auto-created on register |
| USER → EMPLOYER | 1:0..1 | Only if role = EMPLOYER; auto-created on register |
| EMPLOYER → JOB | 1:many | Employer can post multiple jobs |
| JOB → APPLICATION | 1:many | One job receives many applications |
| WORKER → APPLICATION | 1:many | Worker applies to many jobs; unique per (workerId, jobId) |
| APPLICATION → DISPUTE | 1:0..1 | At most one dispute per application |
| USER → DISPUTE | 1:many | Either WORKER or EMPLOYER can raise disputes |
| WORKER → SCORE_EVENT | 1:many | Full audit trail of all score changes |
| APPLICATION → SCORE_EVENT | 1:many | Score events reference the triggering application |
| WORKER → VERIFICATION | 1:many | Worker can submit multiple verification attempts |
| USER → NOTIFICATION | 1:many | System notifications for outcomes and dispute results |
| JOB → WORKER (assignedWorkerId) | many:0..1 | A job can be assigned to at most one worker |

---

## Index Summary

| Collection | Field(s) | Index Type | Purpose |
|---|---|---|---|
| users | email | Unique | Fast login lookup, prevent duplicates |
| workers | userId | Unique | One worker profile per user |
| employers | userId | Unique | One employer profile per user |
| jobs | status | Single | Fast filtering of OPEN jobs |
| jobs | requiredSkills | Multikey | Skill-based job search |
| applications | (workerId, jobId) | Compound Unique | Prevent duplicate applications |
| scoreevents | workerId | Single | Fast score history lookup |
| disputes | status | Single | Filter open/pending disputes |
| notifications | userId | Single | Fast notification retrieval |

---

## Score Event Delta Reference

| eventType | delta | Trigger |
|---|---|---|
| WORK_CONFIRMED | +5 | Employer confirms satisfactory work |
| WORK_REJECTED | −3 | Employer marks work as rejected |
| GHOST | −8 | Worker marked as no-show |
| DISPUTE_WON | +4 | Admin rules in worker's favour |
| DISPUTE_LOST | −6 | Admin rules against worker |

Score is clamped to [0, 100]. Starting score is 50. Updates are atomic (MongoDB session).
