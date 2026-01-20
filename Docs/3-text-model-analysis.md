# 3-Text Model Analysis: Deep Brainstorm

## Executive Summary

After reviewing the proposed **3-Text Model** from `AI-Agent-Instructions-3-Text-Model.md` and comparing it with our current implementation plus the earlier brainstorm (`multi-round-negotiation-brainstorm.md`), here's my comprehensive analysis.

**TL;DR:** The 3-Text Model is **conceptually strong and would work well** for this project. However, it requires **reconciliation with what we just implemented** (Phase 1 of multi-round tracking). The best path is a **hybrid approach** that incorporates the 3-Text clarity while preserving the version history architecture we built.

---

## Current State Analysis

### What We Have Now (Just Implemented)

```typescript
// ClauseItem fields:
clauseText: string;           // Original/baseline text
proposedChange: string;       // What counterparty wants (their request summary)
counterProposal: string;      // Our response summary
counterproposalWording: string; // Our actual proposed text

// ClauseVersion (history tracking):
{
  round?: number;
  party?: NegotiationParty;  // 'us' | 'them' | 'original'
  clauseText: string;
  proposedChange?: string;
  counterProposal?: string;
  counterproposalWording: string;
  notes?: string;
}
```

### What the 3-Text Model Proposes

```typescript
// ClauseItem fields:
baselineText: string;      // Starting point - NEVER changes
theirPosition: string;     // Counterparty's CURRENT stance
ourPosition: string;       // Our CURRENT stance

currentRound: number;
versions: ClauseVersion[];
```

---

## Key Insight: Conceptual Clarity

The 3-Text Model addresses a **fundamental confusion** in our current field naming:

| Current Field | What We Think It Means | What It Actually Represents |
|--------------|------------------------|---------------------------|
| `clauseText` | "Original text" | The starting baseline |
| `proposedChange` | "What they changed" | Counterparty's current position |
| `counterproposalWording` | "Our counter text" | Our current position |

The 3-Text Model makes this explicit:
- **Baseline** = Starting point (immutable)
- **Their Position** = What counterparty wants NOW
- **Our Position** = What we want NOW

This naming is **more intuitive** for users.

---

## Fit Assessment: Strengths

### ✅ 1. Paper Source Clarity

The 3-Text Model explicitly handles the **paper source problem**:

```
If OUR paper:
  Baseline = Our template
  Their Position = Their markup
  Our Position = Our response to their markup

If THEIR paper:
  Baseline = Their contract
  Their Position = Their stance (initially = baseline)
  Our Position = Our redlines
```

**This is exactly the confusion we've been trying to solve.**

### ✅ 2. Round Tracking Alignment

The model's round tracking matches what we built:
- `currentRound` on ClauseItem
- Versions capture snapshots with round numbers

### ✅ 3. Diff Comparison Simplicity

The 3-Text Model offers **3 natural comparison pairs**:
- Baseline ↔ Theirs (what did they change?)
- Theirs ↔ Ours (where do we disagree?)
- Baseline ↔ Ours (how far from original?)

Our current UI in `ComparisonModal` can adapt to this cleanly.

### ✅ 4. Data Model is Similar

The actual data structure is nearly identical to what we have. It's mostly a **rename** with **semantic clarity**:

```typescript
// Current → 3-Text Mapping
clauseText → baselineText
theirPosition → new concept (we used proposedChange for summary)
ourPosition → counterproposalWording (conceptual match)
```

---

## Fit Assessment: Challenges

### ⚠️ 1. Proposed Change vs Their Position

**Current Model:**
- `proposedChange` = Summary/description of what they want
- `clauseText` = Full original text

**3-Text Model:**
- `theirPosition` = Full text of what they currently want

**Question:** Do we need BOTH a summary (`issue`/`proposedChange`) AND full text (`theirPosition`)?

**Recommendation:** Yes, keep both:
- `theirPosition` = Full proposed wording (the actual text)
- `proposedChange` or `issue` = Human-readable summary of the issue

### ⚠️ 2. Counter-Proposal Split

**Current Model:**
- `counterProposal` = Summary of our response
- `counterproposalWording` = Actual text of our response

**3-Text Model:**
- `ourPosition` = Only the text

**Recommendation:** Keep the summary concept via `rationale` or merge with `issue` field.

### ⚠️ 3. Migration Complexity

We have existing demo data and templates. Migration requires:
1. Rename `clauseText` → `baselineText`
2. Create `theirPosition` (potentially copy from `clauseText` or `proposedChange`)
3. Rename `counterproposalWording` → `ourPosition`
4. Increment storage version
5. Update templates with same structure

### ⚠️ 4. Version History Already Implemented

We just built version tracking that snapshots the OLD fields. The 3-Text Model needs versions to snapshot the NEW fields.

**Migration Path:**
```typescript
// Old version structure
{ clauseText, counterproposalWording, ... }

// New version structure  
{ baselineText, theirPosition, ourPosition, ... }
```

---

## Hybrid Recommendation

### Proposed Final Data Model

```typescript
interface ClauseItem {
  id: number;
  clauseNumber: string;
  topic: string;
  
  // ===== THE 3 TEXTS (3-Text Model) =====
  baselineText: string;       // Starting point - rarely changes
  theirPosition: string;      // Their CURRENT proposed text
  ourPosition: string;        // Our CURRENT response text
  
  // ===== SUMMARIES (Keep for readability) =====
  issue: string;              // What's being negotiated (human summary)
  rationale: string;          // Why we're taking our position
  
  // ===== ROUND & STATE =====
  currentRound: number;
  status: ClauseStatus;
  priority: Priority;
  owner: string;
  
  // ===== RISK & IMPACT =====
  riskLevel: RiskLevel;
  impactCategory: string;
  impactSubcategory: string;
  
  // ===== HISTORY =====
  versions: ClauseVersion[];
  
  // ===== TEMPLATE REFERENCE =====
  templateId?: string;
  templateClauseId?: string;
}

interface ClauseVersion {
  id: string;
  round: number;
  party: NegotiationParty;
  label: string;
  timestamp: string;
  
  // Snapshot of the 3 texts
  baselineText: string;
  theirPosition: string;
  ourPosition: string;
  
  // Snapshot of state
  status: ClauseStatus;
  notes?: string;
}
```

### Fields to Deprecate/Rename

| Current Field | Action | New Name/Location |
|--------------|--------|-------------------|
| `clauseText` | Rename | `baselineText` |
| `proposedChange` | Merge | Store full text in `theirPosition`, summary in `issue` |
| `counterProposal` | Merge | Store in `rationale` or remove |
| `counterproposalWording` | Rename | `ourPosition` |

---

## Implementation Phases

### Phase A: Field Renaming (Low Risk)

1. Add new fields as aliases
2. Update all references
3. Migrate data
4. Remove old field names

### Phase B: UI Updates (Medium Risk)

1. Update form labels based on paper source
2. Update ComparisonModal with 3-way diff tabs
3. Update table columns

### Phase C: Version History Update (Low Risk)

1. Update version snapshots to use new field names
2. Migration for existing versions

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Data migration breaks existing contracts | Medium | High | Add migration function, test thoroughly |
| Template structure mismatch | Low | Medium | Migrate templates simultaneously |
| Export/import format breaks | Medium | Medium | Update export functions, version the format |
| UI confusion during transition | Low | Low | Clear field labels, contextual help |

---

## My Recommendation

**YES, implement the 3-Text Model**, but do it incrementally:

### Step 1: Rename Fields (This Week)
- `clauseText` → `baselineText`
- `counterproposalWording` → `ourPosition`
- Add `theirPosition` as explicit field

### Step 2: Keep Summary Fields (Important!)
- Don't remove `issue` - it's the human-readable summary
- Keep or rename `rationale` for explaining our position

### Step 3: Update Comparison Modal
- Add 3-way diff tabs (Baseline↔Theirs, Theirs↔Ours, Baseline↔Ours)
- Smart default based on paper source

### Step 4: Update Forms
- Dynamic labels based on paper source
- 3 text areas for the 3 texts

### Step 5: Migrate Data
- Storage version v4
- Auto-migrate old data on load

---

## Conclusion

The 3-Text Model is **well-suited** for this project because:

1. **Conceptual clarity** - Makes the paper source distinction crystal clear
2. **User-friendly naming** - "Baseline", "Their Position", "Our Position" are intuitive
3. **Diff-friendly** - Natural 3-way comparison
4. **Round-aware** - Works perfectly with our version tracking
5. **Similar structure** - Not a fundamental rewrite, mostly renaming

**However**, we should:
1. Keep summary fields (`issue`, `rationale`) for human readability
2. Migrate incrementally to avoid breaking changes
3. Update the Phase 1 code we just wrote to use new field names

**Estimated Additional Effort:** 2-3 hours on top of Phase 1 (mostly renaming + UI polish)

---

## Questions for User Decision

1. Should `proposedChange` become ONLY `theirPosition` (full text), or keep both summary + full text?

2. Do we want to implement the 3-way diff tabs now or keep current comparison?

3. Should we migrate existing demo data or reset it with new sample data?
