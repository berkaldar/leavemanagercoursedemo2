# Backlog — deferred findings

Findings a human triaged as **defer**: real, but fixed later by decision (`workflows/feature-development.md`,
step 7). Nothing lands here without that decision; noise is rejected in the triage record, not parked here.

- A criterion moved out at the ship gate (R-08, `→ moved to B-<n>`) lands here too, by the
  human's ship decision; the entry names the spec and criterion.
- One entry per finding, newest last. Delete the entry in the commit of the work that closes it.
- An entry that grows into new behavior becomes a spec (`specs/active/`), not a fix.

<!-- Format (labels stay English):
- **B-<n>** — <finding, one line> — Source: spec <NNNN>, review round <n> (<file:line>) — Severity: <…>
  — Recommendation: <the reviewer's action> — Deferred by: <name>, <YYYY-MM-DD>, <why>
  A decision deferred at bootstrap (its REPORT) uses Source: bootstrap <YYYY-MM-DD>.
-->
- **B-1** — README enforcement table understates this repo: no row for "no direct push to `main`", and the force-push and CI-green rows ignore branch protection — Source: chore/git-hygiene (PR #5) and chore/branch-protection (PR #7, finding 1), review round 1 (`README.md:130-150`) — Severity: Low
  — Recommendation: add a row "No direct push to `main`: Enforced (GitHub branch protection) for all tools, plus hook + merge ask for Claude Code"; qualify the force-push and CI-green rows with "Enforced on `main` (branch protection)" — Deferred by: Berk, 2026-11-14, outside PR #5 and PR #7 scope (README is generic ANEW text)
- **B-2** — Sign out shows the sign-in form even when the API did not end the session (API down or 5xx); a reload then shows the user signed in again — Source: spec 0002, review round 1 (`apps/web/src/app.tsx:25`, `apps/web/src/api.ts:31-33`) — Severity: Low
  — Recommendation: decide a "sign out failed" state in a spec; then switch to signed-out only on 204 or 401 — Deferred by: Berk, 2026-11-14, the spec defines no such state
