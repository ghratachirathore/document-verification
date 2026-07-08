# API Documentation

Base URL:

```text
http://localhost:8000/api/v1
```

Authentication:

- JWT is returned from login/register.
- Client sends `Authorization: Bearer <token>`.
- HTTP-only cookie `accessToken` is also set for browser flows.

## Auth

### Register

`POST /auth/register`

```json
{
  "name": "Candidate Name",
  "email": "candidate@example.com",
  "password": "EduVfy-Candidate-2026!p9Q4zL2",
  "role": "candidate"
}
```

### Login

`POST /auth/login`

```json
{
  "email": "hr@eduverify.ai",
  "password": "EduVfy-Recruiter-2026!R7mK8sT3"
}
```

### Me

`GET /auth/me`

### Logout

`POST /auth/logout`

## Candidate

### Candidate Workspace

`GET /candidates/me`

Returns:

- candidate profile
- uploaded documents
- latest verification record
- credential summary

### Candidate Report

`GET /candidates/me/report`

Returns:

- latest verification record
- AI credential summary

## Documents

### List Documents

`GET /documents`

### Upload Document

`POST /documents/upload`

Form data:

- `type`: `resume`, `marksheet`, or `internshipCertificate`
- `document`: PDF, Word, JPG, or PNG

### Replace Document

`PUT /documents/:id/replace`

Form data:

- `type`
- `document`

## HR

### Analytics

`GET /hr/analytics`

Returns:

- overview metrics
- hiring insights
- verification insights
- review queue
- trends
- recent activity

### Candidate Explorer

`GET /hr/candidates`

Supported query params:

- `search`
- `skill`
- `branch`
- `degree`
- `status`
- `riskLevel=low|minor|review|high`
- `minCgpa`
- `maxCgpa`
- `internshipVerified=true|false`
- `uploadedToday=true`
- `awaitingReview=true`
- `clarificationPending=true`

### Candidate Detail

`GET /hr/candidates/:id`

### HR Action

`PATCH /hr/candidates/:id/action`

```json
{
  "action": "approve"
}
```

Supported actions:

- `approve`
- `reject`
- `request_clarification`

### Request Clarification

`POST /hr/candidates/:id/clarifications`

```json
{
  "message": "Please upload internship proof."
}
```
