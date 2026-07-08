# EduVerify AI

**AI-Powered Candidate Intelligence, Credential Verification & Recruiter Workflow Platform**

EduVerify AI is an enterprise-style MERN SaaS platform for HR teams. Candidates upload academic and professional evidence, Gemini extracts structured intelligence, the backend verification engine validates claims deterministically, and recruiters work through analytics, review queues, evidence panels, and decision workflows.

EduVerify AI is **not** a chatbot, OCR demo, resume parser, or fake degree detector. It is a recruiter productivity platform built around candidate intelligence and verification workflow.

## Product Capabilities

- Candidate Intelligence Portal
- Academic and Professional Profiles
- Evidence Center for claim-to-document support
- AI-generated summaries and insights
- Backend-owned verification engine
- HR Command Center with analytics and trends
- Hiring Insights and Verification Insights
- Review Queue and Candidate Explorer
- Clarification, approve, and reject workflows
- Demo fallback mode for local review without external credentials

## Tech Stack

Frontend:
- React
- React Router
- Axios
- Context API
- Lucide icons

Backend:
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- Cloudinary
- Google Gemini

Architecture:
- ES Modules
- MVC
- Service Layer
- `asyncHandler`
- `ApiError`
- `ApiResponse`

## Demo Credentials

Demo mode works when MongoDB, Cloudinary, or Gemini credentials are missing.

| Role | Email | Password |
|---|---|---|
| Candidate | `candidate@eduverify.ai` | `EduVfy-Candidate-2026!p9Q4zL2` |
| Reviewer | `hr@eduverify.ai` | `EduVfy-Recruiter-2026!R7mK8sT3` |

Chrome Password Manager may warn users when they choose a password that appears in known breaches. EduVerify AI hashes passwords with bcrypt and never stores plaintext passwords.

## Quick Start

```bash
npm run install:all
npm run dev
```

Client: `http://localhost:5173`  
API: `http://localhost:8000/api/v1`

## Quality Checks

```bash
npm test --prefix server
npm run build --prefix client
```

Tests run in deterministic demo mode, so they do not depend on a reachable MongoDB connection.

## Documentation

- [Environment Documentation](docs/ENVIRONMENT.md)
- [Setup Guide](docs/SETUP.md)
- [API Documentation](docs/API.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Deployment Checklist](docs/DEPLOYMENT_CHECKLIST.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Project Structure](docs/PROJECT_STRUCTURE.md)
- [Database Schema](docs/DATABASE_SCHEMA.md)
- [API Integration Report](docs/API_INTEGRATION_REPORT.md)
- [Security](docs/SECURITY.md)
- [Testing](docs/TESTING.md)
- [MongoDB Atlas Setup](docs/MONGODB_ATLAS.md)
- [Cloudinary Configuration](docs/CLOUDINARY.md)
- [Gemini Configuration](docs/GEMINI.md)
- [Changelog](docs/CHANGELOG.md)

Postman collection:

- [EduVerifyAI.postman_collection.json](postman/EduVerifyAI.postman_collection.json)

## Verification Philosophy

Gemini extracts and summarizes information. Gemini never approves, rejects, or makes final verification decisions.

The backend controls:

- Name consistency
- CGPA support
- Branch support
- Passing year support
- Internship evidence validation
- Confidence scoring
- Verification status
- HR recommended action

HR controls:

- Approval
- Rejection
- Clarification requests

## Verification Confidence Bands

| Confidence | Status |
|---:|---|
| `>= 95` | Verified |
| `>= 85` | Verified With Minor Differences |
| `>= 65` | Needs Review |
| `< 65` | High Risk Inconsistency |
