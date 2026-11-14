# Conventions

> Only rules that are real: every rule here is either enforced by tooling (preferred) or checked
> in review. Aspirations don't belong here.

## Language
<!-- Set at bootstrap (step 0) and mirrored in AGENTS.md. Changing it later is allowed — edit both
     places; existing documents are not translated retroactively. -->
- Chat language (interviews, sessions): English
- Document language (docs/, specs, plans, ADRs, review and verify reports): English
- Always English (protocol, not prose): ANEW core files, template headings and field labels,
  `Status:` values (Draft / Approved / In progress / Shipped), `Approved by / on:`, `Source:`.
- Code identifiers, branch names, commit messages: English
- Agent messages (handoff summaries, refusals, `Next:` lines): chat language; command names, file
  paths and protocol fields verbatim.

## Language & framework versions

- Node.js 24 LTS, npm 11, npm workspaces (`apps/api`, `apps/web`, `packages/contracts`).
- TypeScript 6.0 (typescript-eslint supports `<6.1`; TypeScript 7 is its own spec) with `strict`,
  `noUncheckedIndexedAccess`, `erasableSyntaxOnly`.
- Fastify (API), React + Vite (web), SQLite via built-in `node:sqlite`, Vitest, ESLint (flat
  config) + typescript-eslint, Prettier.
- Exact versions: the latest stable major at the walking skeleton, pinned by `package-lock.json`
  and recorded in that spec. Upgrades of a major are their own spec.

## Naming

- Files: `kebab-case.ts` / `.tsx`. Types, React components: `PascalCase`. Functions, variables: `camelCase`.
- Tests next to the code: `<file>.test.ts`; architecture tests in `tests/architecture.test.ts` (repo root: they scan every workspace).
- Module layout: `modules/<name>/{routes,service,repo}.ts` + `index.ts` (public API).
- Error codes: `UPPER_SNAKE_CASE`, one per business rule where it applies (`LEAVE_OVERLAP`, `INSUFFICIENT_BALANCE`).

## Error handling

- Services throw `DomainError(code, message)`; one Fastify error handler maps:
  `DomainError` → 409/422 · schema validation → 400 · authorization → 403 · not logged in → 401 ·
  anything else → 500.
- Response shape is always `{ error: { code, message } }`.
- Never leaked to clients: stack traces, SQL, file paths, session tokens. Unexpected errors are
  logged server-side only.
- Input is validated at the route with JSON Schema (Fastify built-in, `additionalProperties: false`);
  services assume valid shapes but always enforce the BRs and authorization.

## Data rules

- Leave dates: date-only `YYYY-MM-DD` strings, no time zone. Timestamps (`createdAt`,
  `decidedAt`): UTC ISO-8601.
- Leave length and balances: integer working days. No floats (no half days in v1).
- IDs: integers in the DB, numbers in the API.
- SQL is always parameterized; string-built SQL is forbidden.
- Status: TS union `'Pending' | 'Approved' | 'Rejected' | 'Cancelled'`, mirrored by a DB `CHECK`
  constraint. No `enum` (see Known traps).
- "Today" comes from the injected `Clock` (`api/shared`), never `new Date()` in services.

## Known traps
<!-- One line per trap: "<trap> — <what to do instead> — from <spec/finding>". Added when triage
     marks a finding real and the reviewer says a build-time rule would have caught it (Amendment
     A-n). Builders read this section before the first plan step. A trap that tooling can catch
     moves to "Enforced by tooling" instead. -->
- `new Date('YYYY-MM-DD')` parses as UTC midnight, local getters (`getDay()`) shift it a day — do
  working-day math with UTC methods (`getUTCDay()`) or plain string/integer math, never local
  getters on leave dates — from bootstrap.
- `vitest` without `run` starts watch mode and never exits (residue) — every check step and npm
  test script uses `vitest run` — from bootstrap.
- An unclosed Fastify app or DB handle keeps the process alive — anything that builds the app
  calls `await app.close()`, which closes the DB through an `onClose` hook — from bootstrap.
- Fastify's default Ajv strips unknown body properties and coerces types (`removeAdditional`,
  `coerceTypes`): `additionalProperties: false` does not reject a request — set
  `ajv.customOptions` in `buildApp` when a criterion needs rejection. A route without a body
  (e.g. `POST /logout`) has no body schema — from spec 0002 review (L3, A-2).

## Enforced by tooling

- TypeScript `strict` + `noUncheckedIndexedAccess` (typecheck step).
- `erasableSyntaxOnly`: no `enum`, `namespace` or constructor parameter properties — Node's
  built-in TypeScript stripping cannot run them (moved here from Known traps at bootstrap).
- ESLint: typescript-eslint recommended-type-checked incl. `no-floating-promises`;
  `no-restricted-syntax` bans the `dangerouslySetInnerHTML` JSX attribute (no React plugin —
  `eslint-plugin-react` fails the dependency policy, plan 0001 R2).
- Prettier `--check`.
- Forbidden module dependencies: `tests/architecture.test.ts` (`docs/architecture.md`).
