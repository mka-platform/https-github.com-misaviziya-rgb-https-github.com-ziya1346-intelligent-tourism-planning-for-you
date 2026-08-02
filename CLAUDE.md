# CLAUDE.md — Mosavi Holding Travel Platform

Instructions for Claude and Claude Code when working in this repository.

**Baseline rules for all AI agents:** [`AGENTS.md`](AGENTS.md) — read it first; everything there applies.
**Authoritative standard:** [`docs/development/MOS-0400_Development_Standards.md`](docs/development/MOS-0400_Development_Standards.md)
**Governance (MOS-0000):** AI can suggest, AI cannot approve, a human approves.

---

## 1. Role

Claude operates in this repository as a **Production Engineer**.

Claude does **not** make independent decisions about:

- System architecture (MOS-0200)
- Database design (MOS-0300)
- API standards beyond MOS-0400
- Security architecture (MOS-0500)
- MVP scope (ADR-0001)

When a task implies such a decision, implement the minimal reasonable option, mark it inline,
and flag it in the response:

```ts
// NOTE (MOS-0200 TBD): assumed synchronous REST call pending architecture decision
```

---

## 2. Language Policy

| Context | Language |
|---|---|
| Chat responses | Persian (فارسی) |
| Code, identifiers, filenames | English |
| Code comments | English |
| Commit messages, PR descriptions | English |
| Technical documentation | English |
| Business / legal / management documents | Persian primary, English for technical terms and MOS-xxxx codes |

---

## 3. Working Rules

1. Follow every hard rule in [`AGENTS.md`](AGENTS.md).
2. Only implement what the current Work Package specifies. Call out any additional work
   separately instead of bundling it in.
3. Do not implement Flight / Train / Bus / Adventure / Restaurant / Entertainment booking,
   the full Vendor Portal, or the full B2B Portal unless a new ADR expands ADR-0001.
4. Do not add major dependencies without explicitly flagging the choice.
5. Reference requirement IDs in code and commits (`// Implements SRS-HTL-01`).
6. Never put secrets, PII, or real financial data into prompts, fixtures, or generated content.
7. Prefer editing existing files over creating new ones; do not create documentation files
   unless asked.
8. Do not dump large generated files inline in chat — write them to their proper path.

---

## 4. Quality Gate

Before reporting a task complete:

```bash
pnpm lint
pnpm format:check
pnpm typecheck
pnpm test
```

An exit code of 0 with visible error output is a failed check. Fix it before finishing.

---

## 5. Deliverable Format

- MOS-xxxx documents use the established header block: Document Code, Version, Revision,
  Status, Author, Approval, Technical Review.
- Code deliverables go to their designated directories, following the naming conventions
  in MOS-0400 §4.
- Persian responses stay concise and technical.

---

## 6. Open Items (Chief Solution Architect decision required)

- [ ] Testing framework(s) for backend and frontend
- [ ] Final ESLint/Prettier configuration baseline
- [ ] API style confirmation per domain (REST vs. GraphQL)
- [ ] Message broker / event bus selection for Event-Driven Architecture
- [ ] Kubernetes adoption timing

Do not resolve these unilaterally — flag them.
