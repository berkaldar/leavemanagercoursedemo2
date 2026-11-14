# Spec 0001 — Walking skeleton

- Status: Shipped
- Mode: lite
- Plan: `specs/plans/0001-plan.md`
- Self-critique: done

## Intent

The developer of Leave Manager needs a working, verifiable base before the first business
feature: the three parts of the system (API, web app, shared contracts) exist, start, and are
checked by the single verification command. Success means `scripts/check` is no longer a no-op:
it installs, formats, lints, typechecks and tests the code, and the project's architecture rules
and "today" are already under test before any leave logic depends on them. Deliberately not done:
any leave, balance or login behavior, any data storage, and any styling.

## Requirements

- R-1: The project is one repository holding three parts — API, web app, shared contracts — that
  install together with one command from a clean clone on Node 24.
- R-2: The API, when running, answers a health check saying it is up. The health check needs no
  login (the documented default-deny exception, `docs/security.md`) and reveals nothing else.
- R-3: The web app, when running, shows a single page with the product name and a short
  empty-state line. It calls nothing.
- R-4: The system has one source of "today": a clock that returns today's date as `YYYY-MM-DD`
  in the business time zone (`Europe/Istanbul`, one fixed zone for the one company), and that
  tests can fix to any date.
- R-5: The five forbidden dependencies of `docs/architecture.md` are checked automatically; each
  rule fails on a violating example and passes on a compliant one.
- R-6: The tooling rules listed under "Enforced by tooling" (`docs/conventions.md`) are active.
- R-7: `scripts/check` runs real steps: the full profile installs, checks formatting, lints,
  typechecks, tests and audits dependencies; the fast profile does all but install and audit.
- R-8: A developer can start the API and the web app locally with one command each (outside
  `scripts/check`).

## User experience

- Flow: the developer starts the web app and opens it in a browser → sees the page.
- States: success only — the page is static and calls nothing (no loading, error, empty-data or
  no-permission state exists yet).
- Design reference: none — the flow above is the design.
- Accessibility: the product name is the page's single top-level heading; the page has a
  document title and `lang="en"`.

## Constraints & out of scope

- Out of scope: database and `node:sqlite` usage, login/sessions, the `identity`, `leave` and
  `balance` modules, `DomainError` and the error handler, web routing, styling, the web app
  calling the API (the first business feature connects them, with its loading and error states),
  deployment. The health check reveals nothing but `{ "status": "ok" }` (no version, uptime or
  environment).
- Test scope per `docs/testing.md`: unit + architecture tests only. API and UI behavior is proven
  by reproducible observation and screenshot at VERIFY.
- Every new dependency is named in the plan (`docs/security.md`, Dependencies).
- Not a sensitive area.

## Acceptance criteria
- [x] AC-1 — From a clean clone on Node 24, one install command installs the API, web and
  contracts parts together; `./scripts/check` (full) runs that install as its first step.
- [x] AC-2 — The running API answers the health check with "up" (`{ "status": "ok" }`) without
  a login, and the answer contains nothing else.
- [x] AC-3 — The running web app shows one page whose single top-level heading is
  "Leave Manager", followed by the line "Nothing here yet."; document title "Leave Manager",
  `lang="en"`.
- [x] AC-4 — The clock returns today as `YYYY-MM-DD` in `Europe/Istanbul`, including just
  before and just after midnight in that zone (where the UTC date differs); a fixed clock
  returns exactly the date it was given.
- [x] AC-5 — Each of the five forbidden-dependency rules has an architecture-test case that fails
  on a violating example and passes on a compliant one, and the architecture test runs against
  the real source tree in `scripts/check` (passing there while the modules do not exist yet).
- [x] AC-6 — Tooling is active: an `enum` fails typecheck; `dangerouslySetInnerHTML` fails lint;
  a floating promise fails lint; a misformatted file fails the format step. Each violation is
  planted temporarily at VERIFY and removed — never committed.
- [x] AC-7 — `./scripts/check` (full) runs install, format, lint, typecheck, test, audit and is
  green; `./scripts/check --fast` runs format, lint, typecheck, test and is green.
- [x] AC-8 — The API and the web app each start with one documented command and stop cleanly on
  Ctrl+C.

## Definition of Done
- [x] Every acceptance criterion mapped to proof (test or reproducible observation)
- [x] `scripts/check` green
- [x] Independent review done; real findings fixed, noise rejected with written rationale, deferred ones in `specs/backlog.md`
- [x] Docs / ADRs updated if behavior or architecture changed
- [x] Spec moved to `specs/done/` (it becomes immutable there)

## Evidence

Full green: `CHECK GREEN (full, 6 steps, 20 s) @74f1d16` (28 tests); `c6af459` and this ship
commit touch only `specs/` (`git diff --name-only 74f1d16 HEAD -- . :!specs/` prints nothing).
Clean clone at c6af459 outside the repo: `CHECK GREEN (full, 6 steps, 22 s)`. Residue clean
(fast + full) @85e8230; check.conf unchanged since.

| Acceptance criterion | Evidence | Status |
|---|---|---|
| AC-1 | clean clone + `npm ci` installs 3 workspaces; check step `install` first | PASS |
| AC-2 | `apps/api/src/health.test.ts`; `curl /health` → exactly `{"status":"ok"}`, no login; break: extra field → test red, HTTP still stripped (response schema) | PASS |
| AC-3 | headless Playwright: one h1 "Leave Manager", "Nothing here yet.", title, `lang="en"`; S-1 agent-captured, judged by Berk at SHIP, 2026-11-14 | PASS |
| AC-4 | `apps/api/src/shared/clock.test.ts`; breaks: zone UTC / Asia/Tokyo / fixedClock → red | PASS |
| AC-5 | `tests/architecture.test.ts`; 6 breaks (rule 3 ×3, rule 4 regex, empty loader, real web→api import) → red | PASS |
| AC-6 | planted at VERIFY, reverted: enum → typecheck red; dangerouslySetInnerHTML → lint red; floating promise → lint red; misformat → format red | PASS |
| AC-7 | full: install, format, lint, typecheck, test, audit green; fast: 4 steps green, audit skipped | PASS |
| AC-8 | `npm run dev:api` / `npm run dev:web`, real Ctrl+C event → 0 survivors, ports free | PASS |

Versions (package-lock.json): typescript 6.0, fastify 5.12, react 19.3, vite 8.3,
@vitejs/plugin-react 6.3, vitest 5.1, eslint 10.15, typescript-eslint 8.72, prettier 3.10,
@types/node 24.

## Scorecard (fill at ship — honest numbers make the process improvable)
| Metric | Value |
|---|---|
| Spec revisions | 1 (self-critique G1–G5 folded in before approval) |
| Fix rounds | 1 |
| Review findings: real / noise / deferred | 5 / 1 / 0 |
| Regressions introduced | 0 |
| Bugs escaped to production | 0 (not deployed) |
