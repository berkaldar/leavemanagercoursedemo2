# Spec 0001 — Walking skeleton

- Status: In progress
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
- [ ] AC-1 — From a clean clone on Node 24, one install command installs the API, web and
  contracts parts together; `./scripts/check` (full) runs that install as its first step.
- [ ] AC-2 — The running API answers the health check with "up" (`{ "status": "ok" }`) without
  a login, and the answer contains nothing else.
- [ ] AC-3 — The running web app shows one page whose single top-level heading is
  "Leave Manager", followed by the line "Nothing here yet."; document title "Leave Manager",
  `lang="en"`.
- [ ] AC-4 — The clock returns today as `YYYY-MM-DD` in `Europe/Istanbul`, including just
  before and just after midnight in that zone (where the UTC date differs); a fixed clock
  returns exactly the date it was given.
- [ ] AC-5 — Each of the five forbidden-dependency rules has an architecture-test case that fails
  on a violating example and passes on a compliant one, and the architecture test runs against
  the real source tree in `scripts/check` (passing there while the modules do not exist yet).
- [ ] AC-6 — Tooling is active: an `enum` fails typecheck; `dangerouslySetInnerHTML` fails lint;
  a floating promise fails lint; a misformatted file fails the format step. Each violation is
  planted temporarily at VERIFY and removed — never committed.
- [ ] AC-7 — `./scripts/check` (full) runs install, format, lint, typecheck, test, audit and is
  green; `./scripts/check --fast` runs format, lint, typecheck, test and is green.
- [ ] AC-8 — The API and the web app each start with one documented command and stop cleanly on
  Ctrl+C.

## Definition of Done
- [ ] Every acceptance criterion mapped to proof (test or reproducible observation)
- [ ] `scripts/check` green
- [ ] Independent review done; real findings fixed, noise rejected with written rationale, deferred ones in `specs/backlog.md`
- [ ] Docs / ADRs updated if behavior or architecture changed
- [ ] Spec moved to `specs/done/` (it becomes immutable there)

## Scorecard (fill at ship — honest numbers make the process improvable)
| Metric | Value |
|---|---|
| Spec revisions | |
| Fix rounds | |
| Review findings: real / noise / deferred | |
| Regressions introduced | |
| Bugs escaped to production | |
