# Architecture

EduVerify AI uses a split MERN architecture with a React client and an Express API server.

## Frontend

- React renders role-specific SaaS workspaces.
- React Router handles candidate and HR routes.
- Context API manages authenticated user state.
- Axios centralizes API calls and JWT headers.
- Reusable components render tables, status badges, evidence panels, timelines, insight cards, review queues, and action centers.

## Backend

- Express exposes versioned REST endpoints under `/api/v1`.
- Controllers are thin and return `ApiResponse`.
- Services own business workflows and integrations.
- Mongoose models define users, documents, verification records, and credential summaries.
- Middleware owns auth, RBAC, validation, uploads, security headers, rate limiting, and errors.

## Service Boundaries

- `auth.service.js`: registration, login, token payloads, cookie options.
- `candidateWorkflow.service.js`: candidate workspace, reports, document upload workflow.
- `hrWorkflow.service.js`: HR analytics, candidate detail, actions, clarifications.
- `document.service.js`: document persistence.
- `storage.service.js`: Cloudinary or demo storage.
- `gemini.service.js`: Gemini extraction and summaries or demo fallback.
- `verification.service.js`: deterministic verification decisions and evidence generation.
- `analytics.service.js`: recruiter analytics and hiring insights.

## Decision Ownership

Gemini extracts and summarizes. It never verifies, approves, or rejects.

The backend verification engine owns:

- Confidence scores
- Evidence status
- Verification status
- Recommended HR action

HR owns:

- Approval
- Rejection
- Clarification requests
