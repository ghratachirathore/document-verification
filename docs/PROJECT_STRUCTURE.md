# Project Structure

```text
EduVerifyAI/
├── client/
│   ├── src/
│   │   ├── api/              Axios client
│   │   ├── components/       Reusable UI building blocks
│   │   ├── context/          Auth context
│   │   ├── hooks/            Reusable React hooks
│   │   ├── layouts/          Role-aware app shell
│   │   ├── pages/            Candidate and HR screens
│   │   ├── routes/           React Router config
│   │   ├── styles/           Global enterprise SaaS styles
│   │   └── utils/            Formatting helpers
│   └── package.json
├── server/
│   ├── src/
│   │   ├── config/           Env, MongoDB, Cloudinary config
│   │   ├── constants/        Shared backend constants
│   │   ├── controllers/      Thin route handlers
│   │   ├── middlewares/      Auth, validation, upload, errors, rate limit
│   │   ├── models/           Mongoose schemas
│   │   ├── routes/           Express route modules
│   │   ├── services/         Business logic and integrations
│   │   └── utils/            ApiError, ApiResponse, logger, validators
│   ├── tests/                Backend and API tests
│   └── package.json
├── docs/                     Handoff documentation
├── postman/                  Postman collection
├── README.md
└── package.json
```

## Architecture Rule

Controllers call services. Services own workflows. Middleware owns request concerns. Models own persistence shape.
