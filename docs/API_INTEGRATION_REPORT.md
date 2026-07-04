# API Integration Report

## Verified Integration Flow

The following flow was verified against the local development server:

1. Candidate login
2. HR login
3. JWT `/auth/me`
4. Candidate workspace load
5. Candidate document upload
6. Demo storage fallback
7. Demo Gemini extraction fallback
8. Verification engine execution
9. Candidate report refresh
10. HR analytics refresh
11. Candidate filtering
12. Candidate detail workspace
13. Clarification request
14. Approve workflow
15. Reject workflow

## Latest Smoke Result

```json
{
  "authUserRole": "candidate",
  "candidateWorkspaceLoaded": true,
  "uploadStorage": "demo",
  "uploadVerificationStatus": "Verified",
  "reportUpdated": true,
  "hrAnalyticsCandidates": 5,
  "filteredCandidates": 2,
  "detailEvidenceItems": 8,
  "clarificationDecision": "clarification_requested",
  "approveStatus": "approved",
  "rejectStatus": "rejected",
  "analyticsRefreshCandidates": 5
}
```

## External Service Status

No production credentials were present during this audit, so these integrations were verified through fallback mode:

- MongoDB: fallback demo store
- Cloudinary: fallback demo storage
- Gemini: fallback demo extraction and summaries

When credentials are configured, the same service boundaries are used:

- `storage.service.js` sends files to Cloudinary.
- `gemini.service.js` sends documents to Gemini.
- `verification.service.js` remains the source of verification decisions.

## API Compatibility

No public API route names were changed.

The frontend continues to use:

- `/auth/*`
- `/documents/*`
- `/candidates/*`
- `/hr/*`
