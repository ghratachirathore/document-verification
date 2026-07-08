# Deployment Environment Checklist

## Backend

- [ ] `NODE_ENV=production`
- [ ] `PORT` set by platform or configured manually
- [ ] `CLIENT_URL` points to deployed frontend URL
- [ ] `CLIENT_URLS` includes every Vercel/custom frontend origin that should be allowed
- [ ] `JWT_SECRET` is long, random, and not the development fallback
- [ ] `JWT_EXPIRES_IN` configured
- [ ] `MONGODB_URI` points to MongoDB Atlas or production MongoDB
- [ ] Cloudinary variables are set
- [ ] `GEMINI_API_KEY` is set
- [ ] `LOG_LEVEL=info`
- [ ] Backend tests pass

## Frontend

- [ ] `VITE_API_URL` points to deployed backend `/api/v1`
- [ ] Frontend build succeeds
- [ ] Protected routes work after deployment
- [ ] Demo credentials use non-breached passphrases or are disabled for production demos

## External Services

- [ ] MongoDB Atlas network access configured
- [ ] Cloudinary account quota reviewed
- [ ] Gemini billing and quota reviewed

## Security

- [ ] Secrets stored in platform environment variables
- [ ] HTTPS enabled
- [ ] CORS restricted to the deployed frontend origins
- [ ] Production auth cookies are sent over HTTPS with `SameSite=None; Secure`
- [ ] API rate limiting enabled
- [ ] Upload size limit reviewed
- [ ] Logs do not expose secrets
