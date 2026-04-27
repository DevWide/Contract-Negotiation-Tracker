# System Overview — Contract Negotiation Tracker

## 1. What is it?

The **Contract Negotiation Tracker** is a client-side SPA (Single Page Application) designed for legal professionals, procurement teams, and business negotiators. It enables clause-by-clause tracking of contract negotiations across multiple rounds, with full version history and diff comparison.

> ⚠️ Early prototype — intended for demonstration and experimentation with synthetic/dummy data only.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Bundler | Vite |
| Styling | Tailwind CSS + Radix UI primitives |
| State Management | React Context + custom hooks |
| Persistence | Browser `localStorage` (no backend required) |
| Document Parsing | JSZip (DOCX), PDF.js (PDF) |
| Charts | Recharts |
| Animations | Framer Motion |
| Icons | Lucide React |
| Package Manager | pnpm 10.4.1+ (required) |

---

## 3. Architecture
```
negotiation-tracker/
├── client/                    # Frontend SPA
│   ├── src/
│   │   ├── components/        # UI components
│   │   │   ├── ui/            # Base UI primitives (shadcn/ui)
│   │   │   └── onboarding/    # Guided onboarding components
│   │   ├── contexts/          # React Context providers
│   │   ├── hooks/             # Custom hooks
│   │   ├── lib/               # Utility functions
│   │   ├── pages/             # Page-level components
│   │   ├── types/             # TypeScript type definitions
│   │   └── data/              # Sample/seed data
│   └── public/                # Static assets
├── server/                    # Express server (optional, not required)
├── shared/                    # Shared constants
└── Docs/                      # Documentation
```
---

## 4. Core Modules & Features

### 4.1 Contract Management
- Create, edit, and delete contracts
- Fields: Name, Counterparty, Description, Paper Source (Our Paper / Their Paper)
- Ball-in-court tracking: indicates which party needs to act next ("Ball with Us" / "Ball with Them")
- Multi-contract support with header dropdown switcher

### 4.2 Clause Management — 3-Text Model
Each clause tracks **three simultaneous versions**:

| Version | Description |
|---|---|
| **Our Template** | Original starting point (template or first draft) |
| **Their Markup** | Counterparty's current proposed text |
| **Our Response** | Your current proposed response |

Additional clause metadata: Status, Priority, Owner, Risk Level, Impact Category, Clause Number, Topic, Issue Summary.

**Status values:** `No Changes` · `In Discussion` · `Agreed` · `Escalated` · `Blocked`

### 4.3 Visual Diff & Comparison
- Side-by-side and inline diff views
- Three comparison pairs: Baseline ↔ Theirs · Theirs ↔ Ours · Baseline ↔ Ours
- Word-level diff statistics (added/removed/changed)
- Full-screen expansion mode

### 4.4 Multi-Round Negotiation
- Version snapshots per clause per round
- Party attribution (Our Counter / Their Proposal)
- Version restore (rollback to any previous state)

### 4.5 Playbook
- Pre-defined positions for common clause types
- Fallback strategies and red lines
- Counterparty objection tracking
- Linkable from clause context menu
- Full-text search

### 4.6 Templates
- Reusable contract templates with pre-defined clauses
- Import from DOCX, PDF, or TXT
- Auto clause detection and structure extraction
- Template-based contract creation

### 4.7 Dashboard & Analytics
- Clause status distribution (Total / Agreed / In Discussion / Escalated / Blocked / No Changes)
- Completion progress bar
- Priority distribution donut chart (High / Medium / Low)
- Clickable cards filter the clause table

### 4.8 Timeline
- Negotiation lifecycle event log
- Event types: Created · Sent · Received · Review · Escalated · Signed
- Notes per event
- Horizontal visual timeline

### 4.9 Import / Export
- CSV import/export
- JSON full contract export
- DOCX import for template parsing

### 4.10 UX Features
- Light / Dark mode
- Keyboard shortcuts: `Ctrl+N` (new clause), `Esc` (close dialogs)
- Guided onboarding / welcome tour
- Contextual help widget
- Inline editing
- Custom columns (show/hide, reorder)
- Multi-filter: status, priority, owner, impact category, risk level
- Full-text search across clause number, issue, and text content

---

## 5. Data Persistence (localStorage keys)

| Key | Data |
|---|---|
| `negotiation-tracker-contracts` | All contracts and their clauses |
| `negotiation-tracker-templates` | Saved templates |
| `negotiation-tracker-playbook` | Playbook topics |
| `negotiation-tracker-columns` | Column configuration |
| `negotiation-tracker-impact-categories` | Custom impact categories |

> To reset all data: DevTools → Application → Local Storage → Clear All

---

## 6. Main User Flows

### Flow 1 — Create a Contract
`Header dropdown → New Contract → Fill details → Create Contract`

### Flow 2 — Add and Edit Clauses
`Add Clause → Fill 3-text model → Set metadata → Save → Inline edit`

### Flow 3 — Compare Versions
`Clause row → Compare icon (↔) → Select comparison pair → Toggle view mode`

### Flow 4 — Manage Negotiation Rounds
`Compare modal → Version History tab → Save version → Restore version`

### Flow 5 — Use Playbook
`Expand Playbook panel → Search topic → View guidance → Link to clause`

### Flow 6 — Create & Apply Template
`Avatar → Templates → Create / Import → Apply when creating new contract`

### Flow 7 — Track Timeline Events
`Expand Timeline → Add Event → Fill type + notes → Review history`

### Flow 8 — Dashboard Filtering
`Dashboard card click → Clause table filters by selected status`

---

## 7. Known Risks & Areas of Attention

| Area | Risk |
|---|---|
| localStorage-only persistence | Data lost on browser clear; no cross-device sync |
| No authentication | No user isolation; all data shared in same browser |
| No backend validation | All validation is client-side only |
| DOCX/PDF import | Parser quality depends on document structure |
| Prototype disclaimer | Not production-ready; no security/compliance guarantees |
| pnpm 10.4.1+ required | Install fails silently on pnpm 8/9 |
| Onboarding modal | Reappears every time localStorage is cleared — impacts automation |
| Missing data-testid | Duplicate elements cause strict mode violations in Playwright |