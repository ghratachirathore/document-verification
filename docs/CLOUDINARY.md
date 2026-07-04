# Cloudinary Configuration Guide

EduVerify AI uses Cloudinary for document storage when Cloudinary credentials are present.

## Required Variables

```bash
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## Setup Steps

1. Create or log in to a Cloudinary account.
2. Open the Cloudinary dashboard.
3. Copy Cloud Name, API Key, and API Secret.
4. Add the values to `server/.env`.
5. Restart the backend.

## Storage Behavior

Uploaded documents are stored under:

```text
eduverify-ai/<candidateId>/<documentType>
```

Supported document types:

- `resume`
- `marksheet`
- `internshipCertificate`

Supported file formats:

- PDF
- JPG
- PNG
- DOC
- DOCX

## Demo Fallback

If Cloudinary credentials are missing, the app stores demo metadata and remains fully usable for local review.
