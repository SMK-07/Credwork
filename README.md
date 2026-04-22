# Credwork — Trust Score Engine for the Informal Labour Market

**Credwork** is a professional marketplace platform with an embedded dynamic trust engine. It solves the "trust gap" in the informal labour market by providing workers with a verifiable reputation and employers with a reliable indicator of worker quality.

## 🚀 Overview

In the informal sector, workers often lack a track record, and employers lack objective data. Credwork bridges this gap by calculating a **Trust Score (0–100)** for every worker based on verified job outcomes.

### User Roles
-   **👷 Workers**: Build reputation, apply for jobs, earn trust points, and upload documents for verification.
-   **🏢 Employers**: Post jobs, hire workers with high trust scores, and record work outcomes.
-   **🛡️ Admins**: Verify worker identities, resolve disputes, and maintain platform integrity.

## 🛠️ Key Features

-   **Dynamic Trust Scoring**: Atomic score updates (+/-) based on real work performance.
-   **Transparent Audit Trail**: Every score change is logged with a reason, delta, and historical comparison.
-   **Job Lifecycle Management**: Robust state-machine logic for Job and Application statuses.
-   **Identity Verification**: Admin-gated document verification for enhanced worker credibility.
-   **Dispute Resolution**: Recourse mechanism for workers to appeal employer-recorded outcomes.
-   **Real-time Visibility**: Workers can track their application progress and upcoming outcomes.

## 💻 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Vanilla CSS |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | MongoDB Atlas, Mongoose ODM |
| **Auth** | JWT (JSON Web Tokens) + Bcrypt Encryption |
| **File Storage** | Multer (Local Server Storage) |
| **Architecture** | Clean Architecture (Repository & Service Patterns) |

## 📐 Architectural Patterns

-   **Repository Pattern**: Pure data access abstraction decoupled from the business logic.
-   **Observer Pattern**: Decoupled service communication via a central `EventBus`.
-   **Strategy Pattern**: Pluggable scoring algorithms allowing for future rule extensions.
-   **State Machine**: Enforces strict, valid transitions across the job lifecycle.
-   **Singleton Pattern**: Shared connection pools and service instances.

## ⚙️ Getting Started

### Prerequisites
-   Node.js (v18+)
-   MongoDB Atlas account/URI

### 1. Backend Setup
```bash
cd backend
npm install
# Configure .env (see .env.example)
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
# Configure .env with VITE_API_URL
npm run dev
```

## 📊 Trust Score Tiers

| Tier | Score Range | Description |
| :--- | :--- | :--- |
| UNVERIFIED | 0 – 30 | High risk or new suspicious activity. |
| NEW | 31 – 50 | Base entry point for new users. |
| RELIABLE | 51 – 70 | Consistent positive performance. |
| TRUSTED | 71 – 85 | High track record of success. |
| ELITE | 86 – 100 | Top-tier workers in the marketplace. |

## 📄 License
This project is licensed under the ISC License.
