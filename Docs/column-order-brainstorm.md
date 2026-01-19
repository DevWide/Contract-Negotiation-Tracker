# Column Order Design Brainstorm

## Human-Centered Design Analysis for Clause Table

### CORRECTED Field Understanding

**My initial assumption was WRONG.** Let me re-analyze based on the actual workflow:

---

## Corrected Field Definitions

| Field | Correct Meaning | Example |
|-------|-----------------|---------|
| **Original Text** | The clause text from the original contract | "Vendor liability capped at 12 months fees" (our paper) or counterparty's paper |
| **Proposed Change** | What the counterparty wants to change | "Counterparty proposes: Liability cap of 36 months" |
| **Counter-Proposal** | Our response to their proposed change | "We suggest: Liability cap of 24 months (middle ground)" |
| **Counter-Proposal Wording** | The exact legal language for our counter | "The aggregate liability shall not exceed fees paid in the preceding twenty-four (24) months" |

---

## Scenario Testing

### Scenario 1: OUR Paper (We drafted the contract)

**Context:** We send our standard MSA to vendor. They mark up with changes.

| Step | What Happens | Field Used |
|------|--------------|------------|
| 1 | We draft original clause | **Original Text**: "Vendor liability capped at 12 months fees" |
| 2 | Counterparty redlines it | **Proposed Change**: "They want 36 months" |
| 3 | We analyze the impact | **Issue**: "Increases our liability exposure significantly" |
| 4 | We respond with middle ground | **Counter-Proposal**: "Accept 24 months as compromise" |
| 5 | We provide exact wording | **Counter-Proposal Wording**: "...not exceed 24 months..." |

**User Flow:**
1. See what we originally wrote → 2. See what they want to change → 3. Understand problem → 4. Formulate response → 5. Write exact text

### Scenario 2: THEIR Paper (Counterparty drafted the contract)

**Context:** Vendor sends us their contract. We need to negotiate.

| Step | What Happens | Field Used |
|------|--------------|------------|
| 1 | They draft the clause | **Original Text**: "Customer liability uncapped" |
| 2 | This IS their proposal | **Proposed Change**: Could be empty OR "Their position is uncapped liability" |
| 3 | We identify the problem | **Issue**: "Unacceptable unlimited liability risk" |
| 4 | We counter-propose | **Counter-Proposal**: "Propose 12 month cap" |
| 5 | Provide our wording | **Counter-Proposal Wording**: "Liability capped at 12 months fees" |

**Key Insight for Their Paper:**
- The "Original Text" IS effectively their proposal
- "Proposed Change" might be:
  - Empty (they're not changing anything, this is their first draft)
  - A description of their stance for clarity
  - Used if they revise during negotiation

---

## Multi-Round Negotiation Scenarios

### Round 1 (Our Paper):
- Original: "12 months cap"
- Their Proposed Change: "They want 36 months"
- Our Counter: "24 months"

### Round 2 (Continued):
- They come back: "32 months"
- Our Counter: "26 months - final offer"

**Question:** How does the system track multiple rounds?
- Version history? 
- Do "Proposed Change" and "Counter-Proposal" get updated each round?

---

## Revised Column Order Analysis

### For OUR Paper Workflow:
```
Timeline: Original (us) → Proposed Change (them) → Counter-Proposal (us)
Reading Order: Left to Right = Chronological negotiation flow
```

**Recommended Order:**
1. Clause # - identifier
2. Topic - category
3. Original Text - OUR starting position
4. Proposed Change - THEIR requested change  
5. Counter-Proposal - OUR response summary
6. Counter-Proposal Wording - OUR response text
7. Issue - Why this matters
8. Impact/Risk/Status/etc.

### For THEIR Paper Workflow:
```
Timeline: Original (them) → [no proposed change initially] → Counter-Proposal (us)
```

**Complication:** "Original Text" now means THEIR position, and "Proposed Change" is less relevant initially.

---

## Key Design Questions

### Question 1: Should column order differ based on Paper Source?
- **Option A:** Same columns, user interprets based on context
- **Option B:** Different views for "Our Paper" vs "Their Paper"
- **Option C:** Rename columns dynamically based on Paper Source

### Question 2: Is "Proposed Change" redundant on Their Paper?
When it's their paper:
- Original Text = Their proposal
- Proposed Change = ? (Their paper = their proposal, so this seems redundant)

**Possible Uses for "Proposed Change" on Their Paper:**
- Track changes they make in subsequent rounds
- Summarize what their clause actually means
- Leave empty if not applicable

---

## Final Recommendation: Column Order

### Chronological Flow (Recommended):
```
1. Clause # (identifier)
2. Topic (category)  
3. Original Text (starting point - whoever's paper)
4. Proposed Change (counterparty's requested change)
5. Issue (the problem we see)
6. Counter-Proposal (our response summary)
7. Counter-Proposal Wording (our exact response text)
8. Impact
9. Risk
10. Status
11. Priority
12. Owner
```

**This follows the negotiation timeline:**
- What started → What they want → Why it matters → What we propose

### Alternative: Problem-Response Grouping
```
1-2. Clause #, Topic
3. Original Text
4. Proposed Change
5. Issue (groups with above as "the problem")
---separator---
6. Counter-Proposal
7. Counter-Proposal Wording (groups as "our response")
---separator---
8-12. Metadata (Impact, Risk, Status, Priority, Owner)
```

---

## Counter-Proposal vs Counter-Proposal Wording Order

**Question:** Which should come first?

### Counter-Proposal FIRST (Recommended):
- Summary before details
- "What do we want?" → "How do we word it?"
- Matches verbal explanation pattern

### Counter-Proposal Wording FIRST:
- Shows actual legal text immediately
- Good if users primarily work with exact wording
- Less cognitive load to find the "real" answer

**Recommendation:** Counter-Proposal (summary) should come before Counter-Proposal Wording (details)

---

## Import/Export Consistency

The CSV format should match the logical workflow:
```csv
Clause #, Topic, Original Text, Proposed Change, Issue, Counter-Proposal, Counter Wording, Impact, Risk, Status, Priority, Owner
```

This ensures exported data tells a complete story when read left-to-right.
