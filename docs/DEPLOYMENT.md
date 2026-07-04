# Deployment Guide

## Recommended Deployment Shape

Keep the existing split architecture:

- Frontend deployed as a static React build.
- Backend deployed as a Node.js service.
- MongoDB Atlas for persistence.
- Cloudinary for document storage.
- Gemini API for extraction and summaries.

## Backend Deployment Checklist

1. Set production environment variables.
2. Ensure `NODE_ENV=production`.
3. Set a strong `JWT_SECRET`.
4. Configure `CLIENT_URL` to the deployed frontend URL.
5. Configure MongoDB Atlas IP access and credentials.
6. Configure Cloudinary credentials.
7. Configure Gemini API key.
8. Run backend tests before deployment.

```bash
npm test --prefix server
```

9. Start server:

```bash
npm start --prefix server
```

## Frontend Deployment Checklist

1. Set `VITE_API_URL` to deployed backend API URL.
2. Build frontend:

```bash
npm run build --prefix client
```

3. Deploy `client/dist`.

## Production Notes

- Demo mode is acceptable for local review only.
- Production should not run with missing MongoDB, Cloudinary, or Gemini credentials.
- CORS must point to the real frontend origin.
- Store secrets in platform environment variables, never in source control.
