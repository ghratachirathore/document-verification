# Environment Documentation

## Server Environment

Create `server/.env` for production-like local runs.

```bash
NODE_ENV=development
PORT=8000
CLIENT_URL=http://localhost:5173
CLIENT_URLS=http://localhost:5173,https://your-vercel-app.vercel.app
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-host>/<database>?retryWrites=true&w=majority
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
GEMINI_API_KEY=your-gemini-key
LOG_LEVEL=info
```

`CLIENT_URL` is the primary frontend origin. `CLIENT_URLS` is optional and accepts a comma-separated allowlist for Vercel preview or custom domains.

## Client Environment

Create `client/.env` only when the API URL differs.

```bash
VITE_API_URL=http://localhost:8000/api/v1
```

For Vercel production:

```bash
VITE_API_URL=https://your-render-service.onrender.com/api/v1
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

Never commit real MongoDB, Cloudinary, Gemini, or JWT secrets. If a secret was ever shared or committed, rotate it in the provider dashboard before deployment.
