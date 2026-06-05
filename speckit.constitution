# Spec Kit Constitution
## Scribble Lab — Engineering Rules & AI Usage Contract

---

## 1. Engineering Principles

### 1.1 TypeScript First
- All new code must be fully typed. `any` is forbidden; use `unknown` when a type is genuinely dynamic.
- Zod schemas are the single source of truth for request payloads on the backend.

### 1.2 Immutability & Purity
- Prefer immutable data structures. Use `structuredClone` for store copies (already established in `roomStore.ts`).
- Pure functions are preferred over stateful mutation wherever possible.

### 1.3 In-Memory Only
- No databases, no persistent storage, no sessions, no authentication. All data lives in the Node.js process.

### 1.4 HTTP Polling — No WebSockets
- All synchronization must happen via HTTP polling. WebSockets, Server-Sent Events, or any push protocol are forbidden.

### 1.5 Error Handling
- Backend: centralized error handler via Express middleware. All domain errors use `HttpError`.
- Frontend: no component may crash on an API failure. All async calls are wrapped in try/catch with user-visible error state.

### 1.6 Determinism
- Game rules (word selection, scoring) must be deterministic and not rely on random at runtime. Use the starter seed data.

---

## 2. Coding Standards

| Rule | Detail |
|------|--------|
| File names | Match existing casing conventions (`camelCase.ts`, `PascalCase.tsx`) |
| Imports | Relative ES module imports. Backend uses `.js` extension for compiled output compatibility. |
| No top-level deps | Do not add new npm packages without explicit justification in the plan. |
| No unrelated refactors | Touch only files needed for the current scenario. |
| Test coverage | Every new backend service export and API endpoint gets at least one unit/integration test. |

---

## 3. AI Usage Rules

### 3.1 What AI May Do
- Generate spec, plan, and task artifacts based on this constitution and the README scenarios.
- Suggest implementation code that follows this constitution.
- Write test cases against acceptance criteria.

### 3.2 What Requires Human Review Before Commit
- Any change to a file not listed in the current scenario's plan.
- Any code that adds a new npm dependency.
- Any change to routing logic or the in-memory store contract.
- Any generated test that does not match the scenario's acceptance criteria.

### 3.3 Self-Review Checklist (before every commit)
- [ ] Does this change correspond to a task in `speckit.tasks`?
- [ ] Is every new type and function fully typed?
- [ ] Does every new API endpoint have at least one test?
- [ ] Does the UI show a user-visible error for every failure case?
- [ ] Have I manually verified the change in a browser before committing?

---

## 4. Spec Discipline

- Spec is updated before implementation begins for each scenario.
- Ambiguity is resolved in `speckit.plan` (assumptions section) before writing code.
- Acceptance criteria are binary: a behavior either passes or it does not.
- Any deviation from the spec during implementation must be documented as a note in the relevant artifact.

---

## 5. Out-of-Scope Enforcement

The following are explicitly out of scope and must not appear in any artifact or commit:

- WebSockets or real-time push
- Databases or persistent storage
- Authentication, accounts, or sessions
- Multiple rounds, timers, or drawer rotation
- Spectator mode, moderation, room passwords
- Rewriting the starter from scratch
- Unjustified dependency additions
