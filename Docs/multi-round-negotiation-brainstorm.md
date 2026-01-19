# Multi-Round Negotiation Tracking - Design Brainstorm

## Problem Statement

In real contract negotiations, parties go back and forth multiple times:
- **Round 1:** We propose 12 months → They counter with 36 months
- **Round 2:** We counter with 24 months → They counter with 30 months  
- **Round 3:** We accept 26 months → Agreement reached

**How does the system track this multi-round negotiation history?**

---

## Current System Analysis

### What Exists Now

The current `ClauseVersion` interface:
```typescript
interface ClauseVersion {
  id: string;
  clauseItemId: number;
  label: string;           // e.g., "Round 1", "Their Counter"
  clauseText: string;      // Snapshot of original text
  counterproposalWording: string;  // Snapshot of our counter
  timestamp: string;
}
```

**Current Capabilities:**
- ✅ Can save snapshots of `clauseText` and `counterproposalWording`
- ✅ Can label versions (e.g., "Round 1", "Before restore")
- ✅ Can compare two versions
- ✅ Can restore previous versions

**Current Limitations:**
- ❌ Only tracks `clauseText` and `counterproposalWording` - not `proposedChange`
- ❌ No distinction between "our version" vs "their version"
- ❌ No clear round numbering system
- ❌ No tracking of WHO made each change

---

## Negotiation Round Modeling Options

### Option A: Enhanced Version History (Extend Current System)

Extend `ClauseVersion` to include all negotiable fields and party attribution:

```typescript
interface ClauseVersion {
  id: string;
  clauseItemId: number;
  label: string;
  round: number;                   // NEW: Round number (1, 2, 3...)
  party: 'us' | 'them';           // NEW: Who made this version
  
  // Snapshot of all negotiable fields
  clauseText: string;
  proposedChange: string;          // NEW
  counterProposal: string;         // NEW
  counterproposalWording: string;
  
  timestamp: string;
  notes?: string;                  // NEW: Notes about this round
}
```

**Workflow:**
1. Import contract → Save as "Round 0 - Original" (them)
2. They propose changes → Save as "Round 1 - Their Request" (them)
3. We counter-propose → Save as "Round 1 - Our Response" (us)
4. They counter → Save as "Round 2 - Their Counter" (them)
5. We respond → Save as "Round 2 - Our Counter" (us)
6. Repeat...

**Pros:**
- Builds on existing infrastructure
- Simple mental model
- Complete history trail

**Cons:**
- Creates many version snapshots
- Storage grows with each round

---

### Option B: Negotiation Thread Model

Instead of versions, model negotiation as a conversation thread:

```typescript
interface NegotiationMessage {
  id: string;
  clauseItemId: number;
  round: number;
  party: 'us' | 'them';
  type: 'proposal' | 'counter' | 'accept' | 'reject' | 'comment';
  
  // The actual proposal/counter content
  proposedWording: string;        // What they/we are proposing
  rationale?: string;             // Why this position
  
  timestamp: string;
}

interface ClauseItem {
  // ... existing fields ...
  negotiationThread: NegotiationMessage[];
}
```

**Workflow:**
1. They send: "36 months" (proposal)
2. We respond: "24 months" (counter) with rationale
3. They respond: "30 months" (counter)
4. We respond: "26 months - final" (counter)
5. They respond: "Accepted" (accept)

**Pros:**
- Models negotiation as natural conversation
- Clear attribution of each position
- Supports comments/discussion

**Cons:**
- More complex data model
- Requires UI redesign for thread view
- May not align with legal document tracking norms

---

### Option C: Dual-Track Model (Recommended)

Track "Their Position" and "Our Position" as parallel tracks that get updated each round:

```typescript
interface ClauseItem {
  // Identification
  id: number;
  clauseNumber: string;
  topic: string;
  
  // ====== THEIR TRACK ======
  originalText: string;           // Starting point
  theirCurrentPosition: string;   // What they want NOW
  theirPositionHistory: PositionHistory[];
  
  // ====== OUR TRACK ======  
  ourCurrentResponse: string;     // Our current counter
  ourCurrentWording: string;      // Our current proposed text
  ourPositionHistory: PositionHistory[];
  
  // ====== NEGOTIATION STATE ======
  currentRound: number;
  status: ClauseStatus;
  
  // Metadata
  issue: string;
  impactCategory: string;
  // ...
}

interface PositionHistory {
  round: number;
  position: string;
  wording?: string;
  timestamp: string;
  notes?: string;
}
```

**Visual Model:**
```
Round | Their Position          | Our Response
------|------------------------|------------------
0     | Original: 12 months    | (starting point)
1     | Proposed: 36 months    | Counter: 24 months
2     | Counter: 30 months     | Counter: 26 months
3     | Accepted: 26 months    | ✓ Agreed
```

**Pros:**
- Clear separation of "their" vs "our" positions
- Easy to see where each party stands
- Natural table visualization
- Supports round-by-round comparison

**Cons:**
- Requires data model changes
- Migration of existing data needed

---

## UI Visualization Options

### Option 1: Inline History Expansion

Current table row with expand button to show history:
```
┌─────────┬─────────┬────────────────┬────────────────────┐
│ Clause  │ Topic   │ Current State  │ Actions            │
├─────────┼─────────┼────────────────┼────────────────────┤
│ 8.1     │ Liability│ In Discussion  │ [Expand] [Edit]    │
└─────────┴─────────┴────────────────┴────────────────────┘
        ↓ Expanded
┌─────────────────────────────────────────────────────────┐
│ Round 1: They want 36mo → We countered 24mo            │
│ Round 2: They countered 30mo → We countered 26mo       │
│ Round 3: They accepted 26mo ✓                          │
└─────────────────────────────────────────────────────────┘
```

### Option 2: Timeline View

Horizontal timeline showing negotiation progression:
```
 Round 1          Round 2          Round 3
    │                │                │
    ▼                ▼                ▼
[36mo]─────────[30mo]─────────[26mo ✓]  ← Their Track
    │                │                │
[24mo]─────────[26mo]─────────[Agreed]  ← Our Track
```

### Option 3: Chat-like Thread

Slack/iMessage style negotiation history:
```
┌──────────────────────────────────────┐
│ Clause 8.1 - Liability Cap          │
├──────────────────────────────────────┤
│ 📄 Original: 12 months               │
│                                      │
│ 🔴 They proposed: 36 months          │
│    "Market standard for enterprise"  │
│                                      │
│ 🟢 We countered: 24 months           │
│    "Double our standard, compromise" │
│                                      │
│ 🔴 They countered: 30 months         │
│                                      │
│ 🟢 We countered: 26 months           │
│    "Final offer"                     │
│                                      │
│ ✅ Agreed: 26 months                 │
└──────────────────────────────────────┘
```

---

## Recommendation

### Phase 1: Enhance Current Version System (Quick Win)

Extend `ClauseVersion` to track:
- `round` number
- `party` attribution
- `proposedChange` field (not just counterproposal)

This builds on existing code with minimal disruption.

### Phase 2: Add Negotiation Timeline UI (Medium Effort)

Add expandable timeline view within each clause showing:
- Round-by-round history
- Their position vs Our response per round
- Quick visual of negotiation progression

### Phase 3: Full Dual-Track Model (Future)

If negotiation tracking becomes core feature, implement full dual-track model with dedicated "Their Track" and "Our Track" columns.

---

## Data Model Proposal (Phase 1)

### Updated ClauseVersion:
```typescript
interface ClauseVersion {
  id: string;
  clauseItemId: number;
  
  // Round tracking
  round: number;
  party: 'us' | 'them' | 'original';
  label: string;
  
  // All negotiable fields
  clauseText: string;
  proposedChange: string;
  counterProposal: string;
  counterproposalWording: string;
  
  timestamp: string;
  notes?: string;
}
```

### Auto-Save Triggers:
1. When user edits clause and saves → Auto-save version
2. When importing counterparty's redlines → Auto-save as "their" version
3. Before sending counter-proposal → Auto-save current state

### Version Labels:
- "Original" - Initial state
- "Round 1 - Their Proposal"
- "Round 1 - Our Counter"
- "Round 2 - Their Counter"
- "Round 2 - Our Counter"
- "Final - Agreed"

---

## Summary

**How to track multiple rounds?**

1. **Extend version history** to include `round`, `party`, and all negotiable fields
2. **Auto-save versions** at key negotiation points
3. **Add timeline UI** to visualize round-by-round progression
4. **Future:** Consider dual-track model for advanced negotiation tracking

The key insight is that negotiation is a **dialog**, not just a series of document revisions. The system should capture WHO said WHAT in WHICH round, not just "what changed."
