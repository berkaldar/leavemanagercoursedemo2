# Domain

> The shared language between business, humans, and agents.
> If a term isn't here, expect the AI to invent its own meaning for it.

**Product:** Leave Manager — a web app where an employee submits a leave request (type, date
range, reason), sees their remaining balance and tracks the request's status; their manager
approves or rejects it. Goal: a course demo of the ANEW workflow on a small, realistic domain.

## Ubiquitous language

| Term | Meaning | Notes / not to be confused with |
|---|---|---|
| Employee | A person who requests leave | User (the login account) |
| Manager | The employee who approves/rejects their direct reports' requests | Admin |
| Leave type | `Annual`, `Sick`, `Unpaid` | — |
| Leave request | One request: type, start date, end date, reason, status | Leave (the absence itself) |
| Status | `Pending` → `Approved` / `Rejected`; `Pending` → `Cancelled` | — |
| Leave balance | Days left of one leave type in the current year | Entitlement (the yearly allowance) |
| Entitlement | The yearly allowance of a leave type (Annual: 14 working days) | Balance |
| Working day | Monday–Friday. Leave length is counted in working days | Calendar day |

## Business rules

- **BR-1:** End date ≥ start date; a request cannot start in the past.
- **BR-2:** Length = the working days in the range (public holidays are out of v1).
- **BR-3:** An `Annual` request cannot exceed the remaining Annual balance; `Sick` and `Unpaid` are not balance-limited.
- **BR-4:** An employee cannot have two overlapping requests in status `Pending` or `Approved`.
- **BR-5:** Only the employee's own manager can approve or reject; a manager cannot approve their own request.
- **BR-6:** Approval deducts the length from the balance; rejection and cancellation do not.
- **BR-7:** Only a `Pending` request can be cancelled, only by its owner. `Approved` and `Rejected` are final.
- **BR-8:** Annual entitlement is 14 working days per calendar year; no carry-over in v1.

## Key domain invariants

- A balance never goes below 0.
- Every balance change traces to exactly one approved request.

## Sensitive areas

- **Approval & balance** — who may approve/reject (BR-5) and every balance change (BR-6, the
  invariants). A mistake here lets someone approve their own leave or makes days appear/disappear.

Not sensitive, by design:
- **Personal data** — the reason field is optional free text; the UI tells users not to enter
  medical details; v1 stores no attachments or medical notes (no special-category health data).
- **Authentication** — demo-grade by decision (`docs/security.md`).
