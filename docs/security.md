# Security

> **Template — filled during bootstrap.** Baseline rules agents must honor in every plan and review.

## Secrets
- Secrets never enter the repo, specs, prompts, or chat. `.env` is gitignored; provide `.env.example`.
- Agents never print secret values, even when debugging.

- Demo seed credentials are not secrets, but the seed refuses to run when `NODE_ENV=production`.

## Input & output

- Every route has a JSON Schema with `additionalProperties: false`; the API accepts only
  `application/json` bodies.
- SQL is always parameterized.
- React escaping stays on; `dangerouslySetInnerHTML` is banned (ESLint `no-restricted-syntax`).
- Never in responses: stack traces, SQL, file paths, session tokens. Never in logs: passwords,
  session tokens, leave reasons.

## AuthN / AuthZ

- **AuthN (demo-grade, by decision):** no sign-up; users are seeded in development. Passwords
  hashed with `node:crypto` `scrypt` (per-user salt), never stored or logged in plain text.
  Sessions: random token stored server-side (SQLite), sent as an `HttpOnly; SameSite=Strict`
  cookie (`Secure` outside localhost), 8-hour expiry. No JWT, no auth library.
- **Default-deny:** every route requires a session except `POST /login` and `GET /health`.
- **AuthZ lives in the service layer**, using the caller identity from the session — the route
  and the UI are never the enforcement point (hiding a button is not authorization).
- Employees see only their own requests and balance; managers also see their direct reports'
  requests. Everything else → 403. BR-5 (approval rights) is a sensitive area (`docs/domain.md`).
- CSRF: covered by `SameSite=Strict` + JSON-only bodies.

## Dependencies

- Built-ins first (`node:sqlite`, `node:crypto`, `node:fs`).
- Every new runtime dependency is named in the plan, with why — the human approves it at the
  plan gate.
- Accepted only with a permissive license (MIT, Apache-2.0, BSD, ISC) and a release in the last
  12 months.
- `npm audit --audit-level=high` runs as a full-only `scripts/check` step (it needs the network;
  its `requires` line checks the registry is reachable).

## Review lens
Security is a mandatory dimension of every independent review (see `prompts/review.md`), not a
separate afterthought phase.
