# MongoDB Atlas Setup Guide

EduVerify AI uses MongoDB through Mongoose.

## Required Variable

```bash
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/eduverify_ai
```

## Atlas Setup

1. Create a MongoDB Atlas project.
2. Create a cluster.
3. Create a database user.
4. Allow your deployment IP address in Network Access.
5. Copy the connection string.
6. Replace username, password, and database name.
7. Add the value to `server/.env`.
8. Restart the backend.

## Collections

- `users`
- `documents`
- `verificationrecords`
- `credentialsummaries`

## Indexes

Indexes are defined in Mongoose models for:

- user email
- candidate status
- HR decision state
- branch
- skills
- candidate documents
- latest verification records
- latest credential summaries

## Demo Fallback

If `MONGODB_URI` is missing, the app uses an in-memory demo store.
