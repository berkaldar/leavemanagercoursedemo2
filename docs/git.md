# Git

> Adjusted at bootstrap (2026-11-14): ANEW defaults kept. Default branch: `main`.

## Branching
- `feature/<spec-no>-<short-name>` — **no branch without a spec.** Also for CHANGE-lane mini-specs.
- Refactors: `refactor/<spec-no>-<short-name>` (mini-spec with Changed behavior = none).
- Fixes: `fix/<report-id>-<short-name>` (bug fixes carry a report, not a spec number);
  incidents: `incident/<date>-<short-name>`; trivial changes: `trivial/<short-name>` (see below).
- Bootstrap: `chore/bootstrap` — the bootstrap output (`workflows/bootstrap.md`), merged like
  any branch. Other workspace and process changes (ADRs, `docs/`, `.claude/`, CI):
  `chore/<short-name>`. `chore/` changes: no spec; PR + one independent reviewer (report posted
  as a PR comment); the trivial one-file limit does not apply.
- **No stacked branches.** Every branch starts from an up-to-date `main`, one open PR per branch.
  A branch that needs another one's work waits until that PR is merged. Squash-merge drops the
  base's commits from `main`, and deleting a base branch closes the PRs that target it.

## Commits
- Conventional Commits, with a plan reference: `feat(catalog): paging endpoint [plan 0001/3]`.
  Review fixes name their fix round instead of the step:
  `fix(catalog): empty page size [plan 0001/fix-2]` — the reviewer counts rounds from these
  (R-06 after round 3).
- Agent commits follow the same standard: the agent writes the message, the human approves it
  through the gate before the commit, not one by one — an approved plan covers its
  `[plan NNNN/n]` and `[plan NNNN/fix-k]` commits, the ship approval the ship commit. Every
  message stays visible in the branch and the PR. Lite and strict alike.
- Only `./scripts/check`'s own exit code gates a commit or a push. Never pipe its output into
  another command in the chain that decides it: in `./scripts/check | grep … && git commit` the
  chain takes grep's exit code, so a red check commits. Keep the output aside and gate on check
  alone: `./scripts/check > check.log 2>&1 && git commit …` (then show `check.log`).
- Commit named paths only: `git commit -- <paths>`, never `git add -A`, `git add .` or
  `commit -a`. Another session or tool may have written or staged files in the same tree.

## Forbidden
- Direct commits to the default branch.
- Force push, history rewriting on shared branches. Undo = `git revert` (see recovery R-11).

## Trivial changes
<!-- Set at bootstrap. Applies only to requests the change-request triage rubric
     (workflows/change-request.md) classifies as TRIVIAL: no acceptance criterion changes, no shared code. -->
- Policy: **(1) PR + one reviewer, no spec** — chosen at bootstrap. Solo: the reviewer is the
  read-only `reviewer` subagent or the developer in a fresh session.
  (Not chosen: (2) direct commit on a `trivial/<short-name>` branch · (3) everything through a
  mini-spec.)
- Always: one narrow commit, `scripts/check` green. A second file or a new test means re-triage.

## Pull requests
- PR template checklist completed; `scripts/check` green in CI; squash-merge.
- **The review is on the PR.** The independent reviewer's report (reviewer subagent or fresh
  session) is posted to the PR as a comment (`gh pr comment`), and the PR description links the
  plan's `## Triage` (when there is a plan; otherwise the triage is recorded in a PR comment).
  A solo developer cannot approve their own PR on GitHub, so this comment is the review record.
- **Enforcement on this repo.** Branch protection is not available for a private repo on
  GitHub Free, so "no direct commits to `main`", "CI green before merge" and "review before
  merge" are not enforced by GitHub. For Claude Code: the `protect-main.sh` hook blocks
  `git push` while on `main`, to a refspec naming `main`, or with `--all`/`--mirror`; every
  `gh pr merge` asks the human first (merge is the human's SHIP step), and `--admin` is denied
  (best effort: text matching, not a shell parser). For humans these rules are not Enforced:
  CI still runs on every push and PR (a red run is visible), but nothing blocks the merge.
