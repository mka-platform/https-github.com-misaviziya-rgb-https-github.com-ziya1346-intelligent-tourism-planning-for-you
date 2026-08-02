# GitHub Copilot Instructions — Mosavi Holding Travel Platform

Full rules: [`AGENTS.md`](../AGENTS.md) · [`docs/development/MOS-0400_Development_Standards.md`](../docs/development/MOS-0400_Development_Standards.md)

## Project

AI-powered tourism and travel booking platform. MVP scope (ADR-0001): Hotel Booking,
Tour Booking, Auth, User Management, Wallet, AI Trip Planner, CMS, Loyalty, Notification,
Reporting. Do not suggest code for out-of-scope domains (flight, train, bus, restaurant,
entertainment booking, vendor/B2B portals).

## Stack

- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS, shadcn/ui,
  TanStack Query, Zustand
- **Backend:** NestJS, Prisma, PostgreSQL, Redis, Swagger, Passport JWT
- **Mobile:** React Native, Expo, TypeScript
- **AI:** Python, LangChain
- **API:** REST, OpenAPI 3.1

Do not suggest alternative frameworks, ORMs, or state managers.

## Code Style

- TypeScript strict mode; never suggest `any` without a justifying comment
- `async/await`, never `var`, prefer `const` over `let`
- One class per file: `hotel.service.ts`, `hotel.controller.ts`, `hotel.dto.ts`
- Must be ESLint- and Prettier-clean (100 char width, 2-space indent, double quotes,
  semicolons, trailing commas)

## Naming

- Files: `kebab-case`
- Classes / Interfaces / Enums: `PascalCase`, no `I` prefix on interfaces
- Variables / functions: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- API routes: lowercase — `/api/v1/hotels`
- DB tables / columns: `snake_case`

## Architecture

Clean Architecture + DDD + Microservices. Layers: Presentation → Application → Domain →
Infrastructure. Dependencies point inward only. Use Repository Pattern, Service Layer, and
Dependency Injection. Never suggest a custom Singleton.

## Required With Every Feature

- DTO + validation for every API input
- Swagger/OpenAPI annotations for every endpoint
- Unit tests (target ≥ 80% coverage); integration tests for core services
- Module `README.md` when adding a new module

## Security

JWT + refresh tokens, RBAC, rate limiting, input validation, Helmet, CORS, Argon2 password
hashing. Never suggest hardcoded secrets, keys, credentials, or real PII — always read from
environment variables.

## Language

All code, identifiers, comments, commits, and technical docs in English.
Frontend must support RTL and `lang="fa"`.

## Commits

Conventional Commits, referencing requirement IDs where applicable:

```text
feat(hotel): implement SRS-HTL-02 price revalidation
fix(payment): resolve callback issue
test(booking): add unit tests
```
