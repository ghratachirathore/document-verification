# Gemini Configuration Guide

EduVerify AI uses Google Gemini for structured extraction and candidate summaries.

Gemini is used for:

- information extraction
- credential summaries
- candidate insights

Gemini is not used for:

- authentication
- verification decisions
- approval decisions
- rejection decisions

## Required Variable

```bash
GEMINI_API_KEY=your-gemini-api-key
```

## Setup Steps

1. Create or open a Google AI Studio account.
2. Generate a Gemini API key.
3. Add it to `server/.env`.
4. Restart the backend.

## Runtime Behavior

When configured, `gemini.service.js` sends uploaded document bytes to Gemini with a strict JSON extraction prompt.

When not configured, deterministic demo extraction is used.

## Safety Boundary

The verification engine always makes final credential status decisions. Gemini only provides extracted data and summaries.
