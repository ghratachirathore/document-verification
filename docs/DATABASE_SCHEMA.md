# Database Schema

EduVerify AI uses MongoDB through Mongoose. Demo mode uses an in-memory store with the same response shape.

## Users

Collection: `users`

Primary fields:

- `name`
- `email`
- `password`
- `role`: `candidate` or `hr`
- `candidateProfile`

Candidate profile includes:

- identity and academic data
- professional profile
- skills, projects, internships
- evidence items
- verification status
- HR decision status
- timeline
- clarifications
- decision history

Indexes:

- `email` unique
- `role, updatedAt`
- `candidateProfile.verificationStatus`
- `candidateProfile.hrDecision`
- `candidateProfile.branch`
- `candidateProfile.skills`

## Documents

Collection: `documents`

Fields:

- `candidate`
- `type`: `resume`, `marksheet`, `internshipCertificate`
- `originalName`
- `mimeType`
- `size`
- `url`
- `publicId`
- `storageProvider`
- `extractedData`
- `uploadedAt`

Indexes:

- unique `candidate, type`
- `candidate, uploadedAt`

## VerificationRecords

Collection: `verificationrecords`

Fields:

- `candidate`
- `status`
- `overallConfidence`
- `checks`
- `evidence`
- `issues`
- `generatedAt`

Indexes:

- `candidate, generatedAt`
- `status, generatedAt`

## CredentialSummaries

Collection: `credentialsummaries`

Fields:

- `candidate`
- `summary`
- `strengths`
- `risks`
- `generatedBy`
- `generatedAt`

Indexes:

- `candidate, generatedAt`
