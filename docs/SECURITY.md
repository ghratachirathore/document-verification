# Security

## Authentication

- JWT-based authentication.
- Tokens are returned in API responses and set as HTTP-only cookies.
- Frontend sends `Authorization: Bearer <token>`.
- Malformed, expired, and invalid tokens return consistent `401` responses.

## Authorization

- Role-based middleware protects candidate and HR routes.
- Candidate routes require `candidate`.
- HR routes require `hr`.

## Validation

The backend validates:

- email format
- password minimum length
- user role
- document type
- HR action
- clarification message
- candidate filter numbers
- resource IDs

## Upload Security

Allowed uploads:

- PDF
- JPG
- PNG
- DOC
- DOCX

Current file size limit:

- 8 MB

## HTTP Security

The API sets:

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-Frame-Options: DENY`

Express `x-powered-by` is disabled.

## Rate Limiting

The API includes a lightweight in-memory limiter:

- 300 requests per 15 minutes per IP

For multi-instance production deployments, replace this with a shared store backed limiter.

## Secrets

Production must provide:

- strong `JWT_SECRET`
- MongoDB credentials
- Cloudinary credentials
- Gemini API key

The server refuses production startup with the development JWT fallback secret.

## External Services

- Cloudinary stores uploaded documents.
- Gemini extracts and summarizes only.
- Gemini never makes final verification or HR decisions.
