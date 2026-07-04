# Setup Guide

## Prerequisites

- Node.js 20+
- npm
- MongoDB Atlas or local MongoDB, optional for demo mode
- Cloudinary account, optional for demo mode
- Google Gemini API key, optional for demo mode

## Install

```bash
cd /Users/apple/Desktop/EduVerifyAI
npm run install:all
```

## Run Development Servers

```bash
npm run dev
```

This starts:

- Backend: `http://localhost:8000`
- Frontend: `http://localhost:5173`

## Run Backend Only

```bash
npm run server
```

## Run Frontend Only

```bash
npm run client
```

## Run Tests

```bash
npm test --prefix server
```

## Build Frontend

```bash
npm run build --prefix client
```

## Local Demo Flow

1. Log in as Candidate.
2. Upload or replace documents.
3. Confirm verification report, evidence center, and timeline update.
4. Log out.
5. Log in as HR.
6. Review dashboard metrics, filtered candidate lists, and candidate detail page.
7. Request clarification, approve, or reject.
