# Testing

## Backend Tests

Run:

```bash
npm test --prefix server
```

Coverage includes:

- authentication API smoke tests
- JWT malformed header handling
- candidate workspace and report
- document upload workflow
- HR analytics
- candidate filtering
- candidate detail
- approve, reject, and clarification workflows
- validation failures
- verification engine scoring
- evidence generation
- analytics builder behavior

## Frontend Build

Run:

```bash
npm run build --prefix client
```

The build verifies:

- React imports
- JSX compilation
- route/page/component bundling
- CSS bundling

## Integration Smoke

With `npm run dev` running, verify:

- candidate login
- HR login
- candidate workspace
- document upload
- report refresh
- HR analytics
- candidate filters
- detail workspace
- HR actions

## Browser Verification

If a browser automation tool is available, open:

```text
http://localhost:5173
```

Check:

- login screen renders
- candidate dashboard renders
- HR dashboard renders
- no console/runtime overlay errors
