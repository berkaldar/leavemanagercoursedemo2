# Architecture

> Describes the architecture *decided on* at bootstrap. Agents read this file before planning.

## System overview

Leave Manager is a **modular monolith**: one Fastify API process (`apps/api`) and one React SPA
(`apps/web`, built with Vite) talking HTTP/JSON, plus a shared types package
(`packages/contracts`). Data lives in one SQLite file via Node's built-in `node:sqlite`. Chosen
because one process and one DB file is the simplest thing that runs, leaves nothing behind after
`scripts/check`, and still gives reviews real module boundaries to check. npm workspaces, Node 24.

```
apps/web  (React SPA) ──HTTP/JSON──▶  apps/api  (Fastify, one process)
                                        ├─ modules/identity   users, roles, manager link, login, sessions
                                        ├─ modules/leave      requests, status transitions, BR-1…BR-7
                                        ├─ modules/balance    entitlements, balance, deductions (BR-6, BR-8)
                                        └─ shared/            db connection, working-day calc, errors, clock
```

Each module has three layers: `routes` (HTTP) → `service` (business rules) → `repo` (SQL), and a
public `index.ts`.

## Modules / components and ownership

| Module | Single responsibility | Owns |
|---|---|---|
| `apps/web` | UI: screens, forms, calling the API | Nothing persistent |
| `packages/contracts` | Request/response types shared by web and api | Type definitions only |
| `api/modules/identity` | Users, roles, the manager link, login, sessions | Users, sessions |
| `api/modules/leave` | Leave requests and their status transitions (BR-1…BR-5, BR-7) | Leave requests |
| `api/modules/balance` | Entitlements, balances, deductions (BR-3 check, BR-6, BR-8) | Balances |
| `api/shared` | DB connection, working-day calculation, `DomainError`, `Clock` | Nothing domain-specific |

## Communication rules

- Web → API only over HTTP/JSON, typed by `packages/contracts`.
- Inside the API: direct, synchronous function calls through a module's public `index.ts` (its
  service). No events or queues in v1.
- Routes are thin (1–3 lines): read the session user, validate input (JSON Schema), call the service.

## Forbidden dependencies (make them testable)

Asserted by `tests/architecture.test.ts` (`docs/testing.md`):

1. `apps/web` never imports from `apps/api`; shared types live only in `packages/contracts`.
2. `routes` never import a `repo` or `node:sqlite`; they go through the `service`.
3. A module never imports another module's internal files (`repo`, `service`, `routes`) — only its `index.ts`.
4. Only `modules/balance` writes balance rows (no other module's SQL touches the balances table).
5. `service` files and `shared/working-days` import neither `fastify` nor `node:sqlite`.

## Deliberately out of scope

Microservices, message queues, multi-tenancy, a public-holiday calendar, email notifications,
half days, carry-over, delegation of approvals, SSO/OAuth.
