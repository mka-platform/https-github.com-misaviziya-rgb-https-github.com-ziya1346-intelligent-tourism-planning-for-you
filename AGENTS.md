# AGENTS.md — Mosavi Holding Travel Platform

Instructions for AI coding agents (ChatGPT, Claude, Codex, GitHub Copilot, Cursor, and others)
working in this repository.

**Authoritative standard:** [`docs/development/MOS-0400_Development_Standards.md`](docs/development/MOS-0400_Development_Standards.md)
**Governance:** MOS-0000 — *AI can suggest, AI cannot approve, a human approves.*

---

## 1. Project Context

- **Project:** Mosavi Holding Travel Platform (هلدینگ خدمات موسوی)
- **Domain:** AI-powered tourism and travel booking super app
- **Governing documents:** MOS-0000 (Charter), MOS-0010 (Business Vision), MOS-0100 (BRD),
  MOS-0110 (SRS), MOS-0400 (Development Standards), ADR-0001 (MVP Scope)
- **MVP scope (ADR-0001):** Hotel Booking, Tour Booking, Auth, User Management, Wallet,
  AI Trip Planner (basic), CMS (basic), Loyalty (basic), Notification, Reporting (basic)

---

## 2. Hard Rules

1. **TypeScript strict mode.** `strict: true`, `noImplicitAny: true`.
2. **No `any`** unless justified with an inline comment explaining why.
3. **Clean Architecture + DDD.** Dependencies point inward only. Domain layer must not
   import frameworks or infrastructure.
4. **Every API needs a DTO and validation.** No unvalidated request bodies or query params.
5. **Every new feature ships with tests and documentation.**
6. **All generated code must pass ESLint and Prettier** with the repo configuration.
7. **Never commit secrets, tokens, API keys, real financial data, or PII** — not in code,
   not in fixtures, not in prompts.
8. **Code, filenames, variables, classes, commits, and technical docs are in English.**
   Business, legal, and management documents may be in Persian.
9. **RTL and `lang="fa"` support is a hard frontend requirement** (Multi-Language First).
10. **Stay inside the current Work Package.** No opportunistic refactors of unrelated code.

---

## 3. Naming Conventions

| Element | Convention | Example |
|---|---|---|
| Files | `kebab-case` | `hotel.service.ts` |
| Classes | `PascalCase` | `HotelService` |
| Interfaces | `PascalCase`, no `I` prefix | `Booking` (not `IBooking`) |
| Enums | `PascalCase` | `BookingStatus` |
| Variables / functions | `camelCase` | `bookingDate`, `calculatePrice()` |
| Constants | `UPPER_SNAKE_CASE` | `MAX_BOOKING_DAYS` |
| API routes | lowercase | `/api/v1/hotels` |
| DB tables / columns | `snake_case` | `hotel_bookings.check_in_date` |

One class per file:

```text
hotel.service.ts
hotel.controller.ts
hotel.module.ts
hotel.entity.ts
hotel.dto.ts
```

---

## 4. Approved Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, React, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, Zustand |
| Backend | NestJS, Prisma, PostgreSQL, Redis, Swagger, Passport JWT |
| Mobile | React Native, Expo, TypeScript |
| AI | Python, LangChain |
| DevOps | Docker, Docker Compose, GitHub Actions, Nginx, Kubernetes (later phase) |
| API | REST, OpenAPI 3.1 |

**Do not introduce new major dependencies** (frameworks, ORMs, state managers, test runners)
without flagging the choice explicitly in your response. That is an architecture decision.

---

## 5. Design Patterns

Use: Repository Pattern, Service Layer, Dependency Injection, CQRS (when needed),
Event-Driven Architecture, Strategy Pattern, Factory Pattern.

Avoid: custom Singletons — use Dependency Injection instead.

---

## 6. Architecture Decision Boundary

When a coding task implies an architecture, database, or API design decision that is not yet
baselined, do **not** decide silently. Implement the minimal reasonable option, mark it, and
flag it in your response:

```ts
// NOTE (MOS-0200 TBD): assumed synchronous REST call pending architecture decision
```

---

## 7. Traceability

When code implements a specific requirement, reference its ID:

```ts
// Implements SRS-HTL-01
```

Commit messages follow Conventional Commits and reference IDs where applicable:

```text
feat(hotel): implement SRS-HTL-02 price revalidation
fix(payment): resolve callback issue
docs(architecture): update API standards
```

---

## 8. Testing Requirements

| Type | Requirement |
|---|---|
| Unit | ≥ 80% coverage |
| Integration | All core services |
| E2E | Full booking flow |

---

## 9. Security Checklist

- JWT + Refresh Token
- RBAC for all protected resources
- Rate Limiting on public endpoints
- Input validation on every entry point
- Helmet and CORS configured
- Argon2 for password hashing
- Secrets via environment variables / secret manager only

---

## 10. Response Language

Conversational replies to the team are in **Persian (فارسی)**.
Code, comments, commits, and technical documentation are in **English**.
