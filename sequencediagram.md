# Sequence Diagrams — Credwork

## 1. User Registration

```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant AuthController
    participant AuthService
    participant WorkerService
    participant EmployerService
    participant MongoDB

    User->>Frontend: Fill register form (email, password, role)
    Frontend->>AuthController: POST /api/auth/register
    AuthController->>AuthService: register(email, password, role)
    AuthService->>MongoDB: Check email uniqueness
    MongoDB-->>AuthService: OK (not duplicate)
    AuthService->>MongoDB: Create User (hashed password)
    MongoDB-->>AuthService: User created

    alt role == WORKER
        AuthService->>WorkerService: createWorkerProfile(userId)
        WorkerService->>MongoDB: Create Worker (score=50, verified=false)
    else role == EMPLOYER
        AuthService->>EmployerService: createEmployerProfile(userId)
        EmployerService->>MongoDB: Create Employer record
    end

    AuthService->>AuthService: generateJWT(userId, role)
    AuthService-->>AuthController: { token, user }
    AuthController-->>Frontend: 201 { token, user }
    Frontend->>Frontend: Store token in localStorage
    Frontend-->>User: Redirect to dashboard
```

---

## 2. User Login

```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant AuthController
    participant AuthService
    participant MongoDB

    User->>Frontend: Enter email + password
    Frontend->>AuthController: POST /api/auth/login
    AuthController->>AuthService: login(email, password)
    AuthService->>MongoDB: Find User by email
    MongoDB-->>AuthService: User document
    AuthService->>AuthService: bcrypt.compare(password, hash)
    
    alt password matches
        AuthService->>AuthService: generateJWT(userId, role)
        AuthService-->>AuthController: { token, user }
        AuthController-->>Frontend: 200 { token, user }
        Frontend->>Frontend: Store token + user in localStorage
        Frontend-->>User: Redirect to role-specific dashboard
    else password mismatch
        AuthService-->>AuthController: throw AppError(401, "Invalid credentials")
        AuthController-->>Frontend: 401 Unauthorized
        Frontend-->>User: Show error message
    end
```

---

## 3. Worker Applies for a Job

```mermaid
sequenceDiagram
    actor Worker
    participant Frontend
    participant AuthMiddleware
    participant ApplicationController
    participant ApplicationService
    participant MongoDB

    Worker->>Frontend: Browse open jobs, click Apply
    Frontend->>AuthMiddleware: POST /api/applications (Bearer token)
    AuthMiddleware->>AuthMiddleware: Verify JWT → attach req.user
    AuthMiddleware->>ApplicationController: Forward request

    ApplicationController->>ApplicationService: applyForJob(workerId, jobId)
    ApplicationService->>MongoDB: Check duplicate application
    MongoDB-->>ApplicationService: No duplicate

    ApplicationService->>MongoDB: Create Application (status=PENDING)
    MongoDB-->>ApplicationService: Application created
    ApplicationService-->>ApplicationController: Application document
    ApplicationController-->>Frontend: 201 Application created
    Frontend-->>Worker: "Application submitted"
```

---

## 4. Employer Assigns Worker and Records Outcome

```mermaid
sequenceDiagram
    actor Employer
    participant Frontend
    participant JobController
    participant JobService
    participant ApplicationService
    participant EventBus
    participant TrustScoreService
    participant NotificationService
    participant MongoDB

    Employer->>Frontend: View applicants → click Assign
    Frontend->>JobController: PATCH /api/jobs/:id/assign { workerId }
    JobController->>JobService: assignWorker(jobId, workerId)
    JobService->>MongoDB: Transition Job: OPEN → ASSIGNED
    JobService->>MongoDB: Update Application: PENDING → ACCEPTED
    MongoDB-->>JobService: Updated
    JobController-->>Frontend: 200 Job assigned

    Employer->>Frontend: Submit outcome (CONFIRMED / REJECTED / GHOST)
    Frontend->>JobController: PATCH /api/jobs/:id/outcome { outcome, reason }
    JobController->>ApplicationService: saveOutcome(applicationId, outcome, reason)
    ApplicationService->>MongoDB: Transition Application: ACCEPTED → OUTCOME_CONFIRMED or GHOSTED
    MongoDB-->>ApplicationService: Updated

    ApplicationService->>EventBus: emit('outcome.confirmed', { workerId, applicationId, outcome, reason })

    EventBus->>TrustScoreService: on('outcome.confirmed')
    TrustScoreService->>TrustScoreService: Select strategy (Standard or Reasoning)
    TrustScoreService->>TrustScoreService: Compute delta
    TrustScoreService->>MongoDB: Start session (atomic)
    TrustScoreService->>MongoDB: Insert ScoreEvent
    TrustScoreService->>MongoDB: Update Worker.trustScore
    TrustScoreService->>MongoDB: Commit session
    MongoDB-->>TrustScoreService: Done

    EventBus->>NotificationService: on('outcome.confirmed')
    NotificationService->>MongoDB: Create Notification for worker
    MongoDB-->>NotificationService: Saved

    JobController-->>Frontend: 200 Outcome recorded
    Frontend-->>Employer: "Outcome submitted"
```

---

## 5. Worker Uploads Verification Document

```mermaid
sequenceDiagram
    actor Worker
    participant Frontend
    participant WorkerController
    participant VerificationService
    participant MongoDB
    participant FileSystem

    Worker->>Frontend: Select ID document, click Upload
    Frontend->>WorkerController: POST /api/workers/verify (multipart/form-data)
    WorkerController->>FileSystem: multer saves file to /uploads/
    FileSystem-->>WorkerController: file path

    WorkerController->>VerificationService: submitVerification(workerId, docType, docPath)
    VerificationService->>MongoDB: Create Verification (status=PENDING)
    MongoDB-->>VerificationService: Saved
    VerificationService-->>WorkerController: Verification document
    WorkerController-->>Frontend: 201 Verification submitted
    Frontend-->>Worker: "Document uploaded. Pending review."
```

---

## 6. Admin Approves / Rejects Verification

```mermaid
sequenceDiagram
    actor Admin
    participant Frontend
    participant AdminController
    participant VerificationService
    participant MongoDB

    Admin->>Frontend: View pending verifications
    Frontend->>AdminController: GET /api/admin/verifications
    AdminController->>VerificationService: getPendingVerifications()
    VerificationService->>MongoDB: Find Verifications (status=PENDING)
    MongoDB-->>VerificationService: List
    AdminController-->>Frontend: 200 Verifications list

    Admin->>Frontend: Click Approve or Reject
    Frontend->>AdminController: PATCH /api/admin/verifications/:id { status, adminNote }
    AdminController->>VerificationService: reviewVerification(verificationId, status, note)
    VerificationService->>MongoDB: Update Verification.status
    
    alt status == APPROVED
        VerificationService->>MongoDB: Set Worker.verified = true
    end

    MongoDB-->>VerificationService: Updated
    VerificationService-->>AdminController: Updated verification
    AdminController-->>Frontend: 200 OK
    Frontend-->>Admin: Status updated
```

---

## 7. Dispute Raised and Resolved

```mermaid
sequenceDiagram
    actor Worker
    actor Admin
    participant Frontend
    participant DisputeController
    participant DisputeService
    participant EventBus
    participant TrustScoreService
    participant NotificationService
    participant MongoDB

    Worker->>Frontend: Raise dispute on rejected outcome
    Frontend->>DisputeController: POST /api/disputes { applicationId, description }
    DisputeController->>DisputeService: raiseDispute(applicationId, raisedBy, role, description)
    DisputeService->>MongoDB: Create Dispute (status=OPEN)
    MongoDB-->>DisputeService: Saved
    DisputeController-->>Frontend: 201 Dispute created
    Frontend-->>Worker: "Dispute submitted"

    Admin->>Frontend: View open disputes
    Frontend->>DisputeController: GET /api/disputes
    DisputeController-->>Frontend: 200 Disputes list

    Admin->>Frontend: Select resolution (WORKER_FAVOUR / WORKER_FAULT)
    Frontend->>DisputeController: PATCH /api/disputes/:id/resolve { resolution }
    DisputeController->>DisputeService: resolveDispute(disputeId, resolution)
    DisputeService->>MongoDB: Update Dispute.status = RESOLVED
    MongoDB-->>DisputeService: Updated

    DisputeService->>EventBus: emit('dispute.resolved', { workerId, applicationId, resolution })

    EventBus->>TrustScoreService: on('dispute.resolved')
    TrustScoreService->>TrustScoreService: Compute delta (DISPUTE_WON +4 or DISPUTE_LOST -6)
    TrustScoreService->>MongoDB: Atomic: Insert ScoreEvent + Update Worker.trustScore

    EventBus->>NotificationService: on('dispute.resolved')
    NotificationService->>MongoDB: Create Notification for worker

    DisputeController-->>Frontend: 200 Dispute resolved
    Frontend-->>Admin: "Dispute resolved"
```

---

## 8. Worker Views Trust Score History

```mermaid
sequenceDiagram
    actor Worker
    participant Frontend
    participant WorkerController
    participant WorkerService
    participant MongoDB

    Worker->>Frontend: Navigate to Profile page
    Frontend->>WorkerController: GET /api/workers/:id/score
    WorkerController->>WorkerService: getWorkerScore(workerId)
    WorkerService->>MongoDB: Find Worker (trustScore, tier)
    WorkerService->>MongoDB: Find ScoreEvents (workerId, sorted by date)
    MongoDB-->>WorkerService: Worker + ScoreEvents
    WorkerService-->>WorkerController: { trustScore, tier, history[] }
    WorkerController-->>Frontend: 200 Score data
    Frontend->>Frontend: Render TrustScoreBadge + history table
    Frontend-->>Worker: Display current score, tier, and full audit trail
```
