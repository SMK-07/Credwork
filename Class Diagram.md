# Class Diagram — Credwork

## Domain / Model Layer

```mermaid
classDiagram

    class User {
        +ObjectId _id
        +String email
        +String passwordHash
        +UserRole role
        +Date createdAt
    }

    class Worker {
        +ObjectId _id
        +ObjectId userId
        +String[] skills
        +Boolean verified
        +Number trustScore
        +Date createdAt
    }

    class Employer {
        +ObjectId _id
        +ObjectId userId
        +String orgName
        +Boolean verified
        +Date createdAt
    }

    class Job {
        +ObjectId _id
        +ObjectId employerId
        +String title
        +String description
        +String[] requiredSkills
        +JobStatus status
        +ObjectId assignedWorkerId
        +Date createdAt
    }

    class Application {
        +ObjectId _id
        +ObjectId workerId
        +ObjectId jobId
        +ApplicationStatus status
        +OutcomeType outcome
        +String outcomeReason
        +Date appliedAt
    }

    class Dispute {
        +ObjectId _id
        +ObjectId applicationId
        +ObjectId raisedBy
        +UserRole raisedByRole
        +String description
        +DisputeStatus status
        +String resolution
        +Date resolvedAt
        +Date createdAt
    }

    class Verification {
        +ObjectId _id
        +ObjectId workerId
        +String docType
        +String docPath
        +VerificationStatus status
        +String adminNote
        +Date verifiedAt
        +Date createdAt
    }

    class ScoreEvent {
        +ObjectId _id
        +ObjectId workerId
        +ObjectId applicationId
        +ScoreEventType eventType
        +Number delta
        +Number scoreBefore
        +Number scoreAfter
        +String reason
        +Date createdAt
    }

    class Notification {
        +ObjectId _id
        +ObjectId userId
        +String message
        +String type
        +Boolean read
        +Date createdAt
    }

    User "1" --> "1" Worker : has profile
    User "1" --> "1" Employer : has profile
    Employer "1" --> "0..*" Job : posts
    Job "1" --> "0..*" Application : receives
    Worker "1" --> "0..*" Application : submits
    Application "1" --> "0..1" Dispute : triggers
    Worker "1" --> "0..*" ScoreEvent : accumulates
    Worker "1" --> "0..*" Verification : submits
    User "1" --> "0..*" Notification : receives
```

---

## Enum Definitions

```mermaid
classDiagram

    class UserRole {
        <<enumeration>>
        WORKER
        EMPLOYER
        ADMIN
    }

    class JobStatus {
        <<enumeration>>
        OPEN
        ASSIGNED
        COMPLETED
        CANCELLED
    }

    class ApplicationStatus {
        <<enumeration>>
        PENDING
        ACCEPTED
        OUTCOME_CONFIRMED
        GHOSTED
    }

    class OutcomeType {
        <<enumeration>>
        CONFIRMED
        REJECTED
        GHOST
    }

    class DisputeStatus {
        <<enumeration>>
        OPEN
        UNDER_REVIEW
        RESOLVED
    }

    class VerificationStatus {
        <<enumeration>>
        PENDING
        APPROVED
        REJECTED
    }

    class ScoreEventType {
        <<enumeration>>
        WORK_CONFIRMED
        WORK_REJECTED
        GHOST
        DISPUTE_WON
        DISPUTE_LOST
    }

    class ScoreTier {
        <<enumeration>>
        UNVERIFIED
        NEW
        RELIABLE
        TRUSTED
        ELITE
    }
```

---

## Service Layer

```mermaid
classDiagram

    class AuthService {
        -IUserRepository userRepo
        -IWorkerRepository workerRepo
        -IEmployerRepository employerRepo
        +register(email, password, role) Promise~AuthResult~
        +login(email, password) Promise~AuthResult~
        +generateJWT(userId, role) String
        +verifyJWT(token) JWTPayload
    }

    class JobService {
        -IJobRepository jobRepo
        +postJob(employerId, data) Promise~Job~
        +listOpenJobs(filters) Promise~Job[]~
        +getJobById(jobId) Promise~Job~
        +getEmployerJobs(employerId) Promise~Job[]~
        +assignWorker(jobId, workerId) Promise~Job~
        +submitOutcome(jobId, outcome, reason) Promise~void~
        +getJobApplications(jobId) Promise~Application[]~
    }

    class ApplicationService {
        -IApplicationRepository appRepo
        +applyForJob(workerId, jobId) Promise~Application~
        +getApplicationById(appId) Promise~Application~
        +saveOutcome(appId, outcome, reason) Promise~void~
    }

    class TrustScoreService {
        -IWorkerRepository workerRepo
        -IScoreEventRepository scoreEventRepo
        -EventBus eventBus
        +computeAndApply(workerId, appId, eventType, reason) Promise~void~
        -selectStrategy(reason) ScoringStrategy
        -clamp(value) Number
    }

    class DisputeService {
        -IDisputeRepository disputeRepo
        -EventBus eventBus
        +raiseDispute(appId, raisedBy, role, description) Promise~Dispute~
        +getAllDisputes() Promise~Dispute[]~
        +resolveDispute(disputeId, resolution) Promise~Dispute~
    }

    class WorkerService {
        -IWorkerRepository workerRepo
        +createWorkerProfile(userId) Promise~Worker~
        +getWorkerProfile(workerId) Promise~Worker~
        +getWorkerScore(workerId) Promise~ScoreData~
        +findByUserId(userId) Promise~Worker~
    }

    class EmployerService {
        -IEmployerRepository employerRepo
        +createEmployerProfile(userId) Promise~Employer~
        +getEmployerProfile(employerId) Promise~Employer~
    }

    class VerificationService {
        -IVerificationRepository verificationRepo
        -IWorkerRepository workerRepo
        +submitVerification(workerId, docType, docPath) Promise~Verification~
        +getPendingVerifications() Promise~Verification[]~
        +reviewVerification(id, status, note) Promise~Verification~
    }

    class NotificationService {
        -INotificationRepository notificationRepo
        -EventBus eventBus
        +createNotification(userId, message, type) Promise~Notification~
    }

    class EventBus {
        <<singleton>>
        -EventEmitter emitter
        +emit(event, payload) void
        +on(event, handler) void
    }

    AuthService --> WorkerService : creates profile
    AuthService --> EmployerService : creates profile
    ApplicationService --> EventBus : emit outcome.confirmed
    DisputeService --> EventBus : emit dispute.resolved
    TrustScoreService --> EventBus : listens
    NotificationService --> EventBus : listens
```

---

## Scoring Strategy Pattern

```mermaid
classDiagram

    class ScoringStrategy {
        <<abstract>>
        +compute(eventType, reason) Number
    }

    class StandardScoring {
        +compute(eventType, reason) Number
    }

    class ReasoningProtocol {
        -Map~String,Number~ modifiers
        +compute(eventType, reason) Number
    }

    class TrustScoreService {
        -selectStrategy(reason) ScoringStrategy
        +computeAndApply(workerId, appId, eventType, reason) Promise~void~
    }

    ScoringStrategy <|-- StandardScoring
    ScoringStrategy <|-- ReasoningProtocol
    TrustScoreService --> ScoringStrategy : uses
```

---

## Repository Pattern

```mermaid
classDiagram

    class IWorkerRepository {
        <<interface>>
        +findById(id) Promise~Worker~
        +findByUserId(userId) Promise~Worker~
        +updateScore(workerId, newScore, session) Promise~void~
        +setVerified(workerId, verified) Promise~void~
    }

    class MongoWorkerRepository {
        +findById(id) Promise~Worker~
        +findByUserId(userId) Promise~Worker~
        +updateScore(workerId, newScore, session) Promise~void~
        +setVerified(workerId, verified) Promise~void~
    }

    class IJobRepository {
        <<interface>>
        +create(data) Promise~Job~
        +findById(id) Promise~Job~
        +findOpen(filters) Promise~Job[]~
        +findByEmployer(employerId) Promise~Job[]~
        +updateStatus(jobId, status) Promise~void~
        +assignWorker(jobId, workerId) Promise~void~
    }

    class MongoJobRepository {
        +create(data) Promise~Job~
        +findById(id) Promise~Job~
        +findOpen(filters) Promise~Job[]~
        +findByEmployer(employerId) Promise~Job[]~
        +updateStatus(jobId, status) Promise~void~
        +assignWorker(jobId, workerId) Promise~void~
    }

    class IApplicationRepository {
        <<interface>>
        +create(data) Promise~Application~
        +findById(id) Promise~Application~
        +findDuplicate(workerId, jobId) Promise~Application~
        +updateStatus(id, status) Promise~void~
        +saveOutcome(id, outcome, reason) Promise~void~
        +findByJobId(jobId) Promise~Application[]~
    }

    class MongoApplicationRepository {
        +create(data) Promise~Application~
        +findById(id) Promise~Application~
        +findDuplicate(workerId, jobId) Promise~Application~
        +updateStatus(id, status) Promise~void~
        +saveOutcome(id, outcome, reason) Promise~void~
        +findByJobId(jobId) Promise~Application[]~
    }

    IWorkerRepository <|.. MongoWorkerRepository
    IJobRepository <|.. MongoJobRepository
    IApplicationRepository <|.. MongoApplicationRepository
```

---

## State Machine

```mermaid
classDiagram

    class StateMachine {
        -Map transitions
        +transition(current, next) void
        +isValidTransition(current, next) Boolean
    }

    class JobStateMachine {
        +transitions: Map
        OPEN --> ASSIGNED
        OPEN --> CANCELLED
        ASSIGNED --> COMPLETED
        ASSIGNED --> CANCELLED
    }

    class ApplicationStateMachine {
        +transitions: Map
        PENDING --> ACCEPTED
        PENDING --> REJECTED
        ACCEPTED --> OUTCOME_CONFIRMED
        ACCEPTED --> GHOSTED
    }

    StateMachine <|-- JobStateMachine
    StateMachine <|-- ApplicationStateMachine
```

---

## Frontend Components

```mermaid
classDiagram

    class App {
        +render() JSX
    }

    class AuthContext {
        +user: User
        +token: String
        +login(user, token) void
        +logout() void
    }

    class AuthProvider {
        -state: AuthState
        +render() JSX
    }

    class ApiClient {
        <<singleton>>
        -axiosInstance: AxiosInstance
        +get(url) Promise
        +post(url, data) Promise
        +patch(url, data) Promise
    }

    class PrivateRoute {
        +allowedRoles: UserRole[]
        +render() JSX
    }

    class Navbar {
        +render() JSX
    }

    class TrustScoreBadge {
        +score: Number
        +tier: ScoreTier
        +render() JSX
    }

    class LoginPage {
        -email: String
        -password: String
        +handleSubmit() void
        +render() JSX
    }

    class RegisterPage {
        -email: String
        -password: String
        -role: UserRole
        +handleSubmit() void
        +render() JSX
    }

    class WorkerProfilePage {
        -worker: Worker
        -scoreHistory: ScoreEvent[]
        +componentDidMount() void
        +handleUpload() void
        +render() JSX
    }

    class WorkerJobsPage {
        -jobs: Job[]
        -skillFilter: String
        +componentDidMount() void
        +handleApply(jobId) void
        +render() JSX
    }

    class EmployerDashboardPage {
        -jobs: Job[]
        +componentDidMount() void
        +handlePostJob() void
        +render() JSX
    }

    class EmployerJobDetailPage {
        -job: Job
        -applications: Application[]
        +handleAssign(workerId) void
        +handleOutcome(outcome) void
        +render() JSX
    }

    class AdminVerificationsPage {
        -verifications: Verification[]
        +handleReview(id, status) void
        +render() JSX
    }

    class AdminDisputesPage {
        -disputes: Dispute[]
        +handleResolve(id, resolution) void
        +render() JSX
    }

    App --> AuthProvider : wraps
    AuthProvider --> AuthContext : provides
    App --> PrivateRoute : guards routes
    App --> Navbar : renders
    PrivateRoute --> LoginPage
    PrivateRoute --> RegisterPage
    PrivateRoute --> WorkerProfilePage
    PrivateRoute --> WorkerJobsPage
    PrivateRoute --> EmployerDashboardPage
    PrivateRoute --> EmployerJobDetailPage
    PrivateRoute --> AdminVerificationsPage
    PrivateRoute --> AdminDisputesPage
    WorkerProfilePage --> TrustScoreBadge : renders
    WorkerProfilePage --> ApiClient : uses
    WorkerJobsPage --> ApiClient : uses
    EmployerDashboardPage --> ApiClient : uses
    EmployerJobDetailPage --> ApiClient : uses
    AdminVerificationsPage --> ApiClient : uses
    AdminDisputesPage --> ApiClient : uses
```
