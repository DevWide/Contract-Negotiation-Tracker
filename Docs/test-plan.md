# Test Plan — Contract Negotiation Tracker

**Project:** Contract Negotiation Tracker  
**Prepared by:** Rafael Barbosa  
**Date:** April 2026  
**Tool:** Playwright (E2E)  
**Environment:** localhost:3000 (pnpm dev)

---

## 1. Scope

This test plan covers end-to-end functional testing of the Contract Negotiation Tracker SPA. Since the application has no backend, test scope focuses on:

- UI interactions and user flows
- localStorage state management and persistence
- Data integrity across operations (create, edit, delete)
- Visual diff and comparison features
- Cross-module integration (e.g., dashboard filters reflecting clause states)

**Out of scope (v1):**
- Performance/load testing (no backend)
- Accessibility audit (WCAG)
- Mobile/responsive testing
- DOCX/PDF import parsing edge cases

---

## 2. Test Strategy

### 2.1 Approach

Given the localStorage-only architecture, the primary risk is **state corruption** — data that doesn't persist correctly, state that leaks between contracts, or UI that diverges from stored data. The test suite prioritizes:

1. **Happy path flows** — core user journeys must work end-to-end
2. **State persistence** — data survives page reload
3. **State isolation** — clearing storage resets the app to empty state
4. **UI ↔ Data consistency** — dashboard counters match actual clause statuses
5. **Edge cases** — empty states, long text, special characters

### 2.2 Test Isolation Strategy

Each test suite clears localStorage before execution via Playwright's `page.evaluate(() => localStorage.clear())` + page reload. This guarantees test independence without a database teardown step.

### 2.3 Tooling

| Tool | Purpose |
|---|---|
| Playwright | E2E browser automation |
| Page Object Model | Abstraction layer for UI selectors |
| Playwright Fixtures | localStorage setup/teardown |
| GitHub Actions | CI execution on every push to main |

---

## 3. Test Suites

### Suite 01 — Contract CRUD (`01-contract-crud.spec.ts`)

**Priority:** Critical  
**Risk area:** Core data creation and persistence

| ID | Test Case | Type |
|---|---|---|
| TC-01 | Create a new contract with all required fields | Happy path |
| TC-03 | New contract appears in header dropdown after creation | Integration |
| TC-06 | Contract data persists after page reload | Persistence |
| TC-08 | Ball-in-court switch toggles between "Ball with Us" and "Ball with Them" | Happy path |
| TC-08b | Ball-in-court toggle state persists after reload | Persistence |
| TC-09 | Switching between contracts loads correct data | Isolation |
| TC-44 | localStorage key is populated on app load | Technical |

---

### Suite 02 — Clause Management (`02-clause-management.spec.ts`)

**Priority:** Critical  
**Risk area:** 3-text model integrity, inline editing

| ID | Test Case | Type |
|---|---|---|
| TC-10 | Add a clause with all three text fields populated | Happy path |
| TC-12 | Clause appears in table after creation | Happy path |
| TC-16 | Clause data persists after page reload | Persistence |
| TC-17 | Form closes after successful clause creation | UX |
| TC-18 | Ctrl+N keyboard shortcut opens new clause form | UX |
| TC-19 | Search filters clause table by text | Functional |
| TC-19b | Clearing search restores full clause list | Functional |

---

### Suite 06 — localStorage Persistence (`06-persistence.spec.ts`)

**Priority:** Critical  
**Risk area:** Only persistence mechanism — failure means total data loss

| ID | Test Case | Type |
|---|---|---|
| TC-42 | Demo contracts are present on fresh load | Persistence |
| TC-43 | User-created clause persists after full reload | Persistence |
| TC-44 | negotiation-tracker-contracts key exists in localStorage | Technical |
| TC-44b | localStorage contracts have valid JSON structure | Technical |
| TC-46 | Multiple clauses all persist after reload | Persistence |
| TC-47 | Ball-in-court state persists after reload | Persistence |

---

## 4. Risk-Based Prioritization

| Risk | Impact | Likelihood | Priority |
|---|---|---|---|
| localStorage data loss on browser clear | High | High | P1 |
| Dashboard counters out of sync with clauses | High | Medium | P1 |
| 3-text model data not saved correctly | High | Low | P1 |
| Version restore overwrites wrong clause | High | Low | P1 |
| Comparison modal showing wrong diff pair | Medium | Medium | P2 |
| Inline edit not persisting | Medium | Medium | P2 |
| Template import parsing failure | Low | Medium | P3 |

---

## 5. Entry & Exit Criteria

**Entry criteria:**
- Application runs locally on `http://localhost:3000`
- `pnpm dev` starts without errors
- Playwright installed and configured

**Exit criteria:**
- Suites 01, 02 and 06 passing (critical priority)
- No P1 bugs open
- All persistence tests green

---

## 6. Test Environment

- OS:          macOS (Apple Silicon M3)
- Node:        22.x
- pnpm:        10.4.1
- Browser:     Chromium (Playwright default)
- Base URL:    http://localhost:3000
- CI:          GitHub Actions (ubuntu-latest)

---

## 7. Out-of-Scope Items (Future Work)

- Playbook CRUD automation
- Template import (DOCX/PDF) E2E
- Settings / Impact Categories management
- CSV import/export validation
- Dark mode visual regression
- Full keyboard navigation coverage