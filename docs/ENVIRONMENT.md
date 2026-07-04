# Environment Documentation

## Server Environment

Create `server/.env` for production-like local runs.

```bash
NODE_ENV=development
PORT=8000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb+srv://user:password@cluster/db
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
GEMINI_API_KEY=your-gemini-key
LOG_LEVEL=info
```

## Client Environment

Create `client/.env` only when the API URL differs.

```bash
VITE_API_URL=http://localhost:8000/api/v1
```

## Fallback Modes

EduVerify AI supports demo fallback mode for placement review:

- Missing `MONGODB_URI`: uses in-memory demo store.
- Missing Cloudinary credentials: uses demo document metadata.
- Missing `GEMINI_API_KEY`: uses deterministic demo extraction and summaries.

Production must set:

- `JWT_SECRET`
- `MONGODB_URI`
- Cloudinary credentials
- `GEMINI_API_KEY`

The server rejects production startup if `JWT_SECRET` is missing and the development fallback secret would be used.
