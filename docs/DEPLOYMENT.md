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
4. Configure `CLIENT_URL` to the primary deployed frontend URL.
5. Configure `CLIENT_URLS` when multiple Vercel/custom domains must be allowed.
6. Configure MongoDB Atlas IP access and credentials.
7. Configure Cloudinary credentials.
8. Configure Gemini API key.
9. Run backend tests before deployment.

```bash
npm test --prefix server
```

10. Start server:

```bash
npm start --prefix server
```

## Frontend Deployment Checklist

1. Set `VITE_API_URL` to deployed backend API URL, for example `https://your-render-service.onrender.com/api/v1`.
2. Build frontend:

```bash
npm run build --prefix client
```

3. Deploy `client/dist`.

## Production Notes

- Demo mode is acceptable for local review only.
- Production should not run with missing MongoDB, Cloudinary, or Gemini credentials.
- CORS must point to the real frontend origin. Use `CLIENT_URLS=https://your-app.vercel.app,https://your-domain.com` for Vercel preview/custom domains.
- Production cookies use `SameSite=None; Secure`, so the backend must be served over HTTPS.
- Store secrets in platform environment variables, never in source control.
