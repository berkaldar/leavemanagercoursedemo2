# Spec 0002 — Sign in / sign out

- Status: Approved
- Mode: lite
- Plan: `specs/plans/0002-plan.md`
- Self-critique: done

## Intent

Employees need to sign in so that later features (leave requests, balance, approvals) know who
they are. An employee opens Leave Manager, signs in with their email and password, sees their
name to confirm the app knows them, and can sign out. Success means a seeded employee can sign in
and out reliably, a wrong attempt never reveals whether the email exists, and nobody reaches user
data without signing in. This is deliberately demo-grade (`docs/security.md`): no sign-up, no
password reset and no lockout. The home page shows only the signed-in name for now.

## Requirements

- Users exist only as seeded development accounts: at least one employee and one manager, each
  with a full name, email and password. There is no sign-up.
- A signed-out visitor sees only the sign-in form, never another page or any user data.
- Signing in takes an email and a password. Email is matched without regard to letter case and
  ignoring leading and trailing spaces; the password is matched exactly.
- A failed attempt gives one generic message that does not say whether the email or the
  password was wrong.
- A signed-in employee sees their full name on the home page and a way to sign out.
- A sign-in lasts until the employee signs out or 8 hours have passed since sign-in, whichever
  comes first. Reloading the page keeps the employee signed in within that time.
- Signing out ends the sign-in on the server too: it cannot be reused afterwards.
- Without a valid sign-in, the server gives out no user data.
- An employee may be signed in from more than one browser at a time; signing out ends only that
  browser's sign-in.
- Input limits: an email longer than 254 characters or a password longer than 128 is treated as a
  failed attempt, with no separate message.

## User experience

- Flow: open the app → sign-in form → enter email and password → Sign in → home page with
  "Signed in as <full name>" and a Sign out button → Sign out → sign-in form again.
- States:
  - **Sign-in form (empty):** email field, password field, Sign in button; nothing filled in.
  - **Missing input:** Sign in pressed with a field empty; a message under each empty field.
  - **Signing in:** the request is in flight; the button is disabled and reads "Signing in…".
  - **Wrong credentials:** "Email or password is incorrect." above the form; the email is kept
    and the password is cleared.
  - **Can't reach server:** "Can't sign in right now. Try again." above the form; both fields
    are kept.
  - **Signed in:** home page with "Signed in as <full name>" and a Sign out button.
- Design reference: https://claude.ai/artifact/7yFe1NyRiXTqtCfXkpsuaP — version "Spec 0002 —
  approved" (version id 1794662543-fd2a), last updated 2026-11-14. Claude Design artifact,
  private; one artboard per state above, named like the state (ADR 0002).
- Accessibility:
  - Every field has a visible label.
  - The keyboard path is email → password → Sign in; Enter submits the form.
  - Error messages are announced to assistive technology.
  - After a failed attempt, focus moves to the first field that needs attention.
  - Text contrast meets WCAG AA.

## Constraints & out of scope

- Demo-grade authentication as decided in `docs/security.md`; no new authentication library.
- Passwords and session tokens never appear in logs, responses or the UI.
- Out of scope: sign-up, password reset or change, "remember me", lockout or rate limiting,
  single sign-on, and any different home page for managers.
- Seed accounts exist in development only; the seed refuses to run in production
  (`docs/security.md`).
- Size: 11 criteria for one capability (who is using the app). Kept as one spec, because sign
  out and session expiry are not useful without sign in.

## Acceptance criteria

- [ ] AC-1 — A signed-out visitor who opens the app sees the empty sign-in form (email,
  password, Sign in) and no user name or other data.
- [ ] AC-2 — Signing in with a seeded employee's correct email and password shows the home page
  with "Signed in as <their full name>" and a Sign out button.
- [ ] AC-3 — Email matching ignores letter case and leading or trailing spaces; a password that
  differs only in letter case is rejected.
- [ ] AC-4 — A wrong password, an unknown email, an email that is not a valid address, and an
  over-long email or password all show exactly "Email or password is incorrect."; the email is
  kept, the password is cleared, and the form stays usable.
- [ ] AC-5 — Pressing Sign in with the email or password empty shows "Enter your email." or
  "Enter your password." under that field, and no sign-in attempt is made.
- [ ] AC-6 — While an attempt is in flight, the button is disabled and reads "Signing in…";
  pressing it again starts no second attempt.
- [ ] AC-7 — If the server can't be reached or fails unexpectedly, the form shows "Can't sign in
  right now. Try again." and keeps both fields.
- [ ] AC-8 — A signed-in employee who reloads the page is still signed in.
- [ ] AC-9 — After Sign out, the sign-in form is shown, a reload still shows it, and the ended
  sign-in no longer gives access to user data.
- [ ] AC-10 — A sign-in gives access for just under 8 hours: from exactly 8 hours after sign-in
  it no longer gives access, and the next page load shows the sign-in form.
- [ ] AC-11 — Without a valid sign-in, any request for user data is refused as not signed in and
  returns no user data.

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
