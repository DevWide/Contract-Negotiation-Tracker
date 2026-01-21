# Playbook Management System Brainstorm

## Current State Analysis

### What We Have Now:
1. **Playbook Topics** - Global list of negotiation guidance organized by category
   - Each topic has: title, description, common objections, negotiation positions
   - Topics are categorized (Liability, Indemnification, Termination, etc.)
   - Has `relatedClauseTypes` to match with clauses

2. **Templates** - Contract templates with predefined clauses
   - Each template has: name, description, list of clauses
   - Each clause has: baseline text, their position, our position, issue, rationale

3. **Contracts** - Active negotiations based on templates
   - Clauses linked to templates via `templateId` and `templateClauseId`

### Current UX Flow:
- Playbook appears as collapsible section at bottom of Home page
- "View Playbook" action on individual clauses shows relevant playbook topics
- Templates managed in separate TemplatesPage
- No explicit connection between playbook topics and templates

---

## The Core Question

**Should Playbooks be tied to Templates?**

### Arguments FOR Template-Specific Playbooks:

1. **Contextual Relevance**
   - Different contract types have different negotiation patterns
   - MSA playbook differs from NDA playbook differs from SLA playbook
   - Software License Agreement has different risk areas than Employment Contract

2. **Industry Specialization**
   - Healthcare MSA needs HIPAA-specific guidance
   - Financial services contracts need regulatory compliance guidance
   - Government contracts have unique clauses and negotiation constraints

3. **Streamlined Experience**
   - When creating contract from template, playbook comes with it
   - No need to manually search for relevant topics
   - Pre-matched guidance for each template clause

4. **Template Authors Know Best**
   - Person creating template understands which playbook entries apply
   - Can customize positions/fallbacks for specific template context

### Arguments FOR Global Playbook (Current Approach):

1. **Reusability**
   - Same "Limitation of Liability" guidance applies across contract types
   - Avoids duplication of common negotiation strategies
   - Single source of truth for negotiation positions

2. **Easier Maintenance**
   - Update playbook once, applies everywhere
   - No version sync issues across templates

3. **Discoverability**
   - Users can browse all available guidance
   - Learn about topics they didn't know to look for

4. **Flexibility**
   - Can apply any playbook topic to any clause
   - Not constrained by template author's assumptions

---

## Recommended Hybrid Approach ⭐

### Architecture: "Global Playbook + Template Mappings"

```
┌─────────────────────────────────────────────────────────────┐
│                    GLOBAL PLAYBOOK                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ Liability   │ │ IP Rights   │ │ Termination │  ...      │
│  │ - Topic 1   │ │ - Topic 3   │ │ - Topic 5   │           │
│  │ - Topic 2   │ │ - Topic 4   │ │             │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
                           ▲
                           │ Links/Recommendations
                           │
┌─────────────────────────────────────────────────────────────┐
│                    TEMPLATES                                 │
│  ┌─────────────────────────┐ ┌─────────────────────────┐    │
│  │ MSA Template            │ │ NDA Template            │    │
│  │ ┌─────────────────────┐ │ │ ┌─────────────────────┐ │    │
│  │ │ Clause: Payment     │ │ │ │ Clause: Definition  │ │    │
│  │ │ → Playbook: [pb-1]  │ │ │ │ → Playbook: [pb-8]  │ │    │
│  │ ├─────────────────────┤ │ │ ├─────────────────────┤ │    │
│  │ │ Clause: Liability   │ │ │ │ Clause: Term        │ │    │
│  │ │ → Playbook: [pb-1,  │ │ │ │ → Playbook: [pb-5]  │ │    │
│  │ │    pb-2]            │ │ │ └─────────────────────┘ │    │
│  │ └─────────────────────┘ │ └─────────────────────────┘    │
│  └─────────────────────────┘                                │
└─────────────────────────────────────────────────────────────┘
```

### How It Works:

1. **Global Playbook Library**
   - Managed in Settings → "Playbook Library" tab
   - Categories, topics, positions all defined here
   - Single source of truth for negotiation guidance

2. **Template Clause Mappings**
   - Each template clause can reference one or more playbook topics
   - Optional: Template can have custom positions that override global defaults
   - Stored in `TemplateClause.playbookTopicIds: string[]`

3. **Runtime Behavior**
   - When viewing clause playbook, show:
     - Linked playbook topics (from template mapping)
     - Related playbook topics (from `relatedClauseTypes` matching)
   - Clearly distinguish "Recommended" vs "Related" topics

---

## UI/UX Design Options

### Option A: Settings Tab Approach (Recommended)

**Settings Modal Tabs:**
1. Column Configuration (existing)
2. Impact Categories (existing)
3. **Playbook Library** (new)
4. Templates → existing but could show playbook mappings

**Playbook Library Tab:**
```
┌──────────────────────────────────────────────────────────────┐
│ Playbook Library                                    [+ Add]  │
├──────────────────────────────────────────────────────────────┤
│ 🔍 Search playbook topics...                                 │
├──────────────────────────────────────────────────────────────┤
│ ▼ Liability (2 topics)                                       │
│   ├── Limitation of Liability                      [Edit][✕] │
│   │   • 3 positions • 3 common objections                    │
│   └── Consequential Damages                        [Edit][✕] │
│       • 2 positions • 2 common objections                    │
├──────────────────────────────────────────────────────────────┤
│ ▼ Indemnification (2 topics)                                 │
│   ├── IP Indemnification                           [Edit][✕] │
│   └── General Indemnity                            [Edit][✕] │
├──────────────────────────────────────────────────────────────┤
│ ▶ Termination (1 topic)                                      │
│ ▶ Data Privacy (1 topic)                                     │
│ ▶ Confidentiality (1 topic)                                  │
└──────────────────────────────────────────────────────────────┘
```

**Edit Playbook Topic Dialog:**
```
┌──────────────────────────────────────────────────────────────┐
│ Edit Playbook Topic                                    [×]   │
├──────────────────────────────────────────────────────────────┤
│ Category:  [Liability          ▼]                            │
│ Title:     [Limitation of Liability_______]                  │
│ Description:                                                 │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │Standard positions for limiting liability exposure...     │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│ Related Clause Types (for auto-matching):                    │
│ [Liability] [Indemnification] [Damages] [+ Add]              │
│                                                              │
│ ─── Common Objections ───                                    │
│ • Counterparty wants unlimited liability...         [✕]     │
│ • Request to remove cap on direct damages           [✕]     │
│ [+ Add Objection]                                            │
│                                                              │
│ ─── Negotiation Positions ───                                │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Position: Cap liability at 12 months of fees...          │ │
│ │ Rationale: Industry standard that balances risk...       │ │
│ │ Fallback: Cap at 24 months if pushback...                │ │
│ │ Red Line: Never accept unlimited liability...            │ │
│ └──────────────────────────────────────────────────────────┘ │
│ [+ Add Position]                                             │
│                                                              │
│                                      [Cancel] [Save Topic]   │
└──────────────────────────────────────────────────────────────┘
```

### Option B: Templates Page Integration

**Templates Page with Playbook Mapping:**
```
┌──────────────────────────────────────────────────────────────┐
│ ← Back to Contracts                      Template Library    │
├──────────────────────────────────────────────────────────────┤
│ [Templates] [Playbook Library]                     [+ New]   │
├──────────────────────────────────────────────────────────────┤
│ When editing a template clause:                              │
│                                                              │
│ Clause 7.1 - Limitation of Liability                         │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Baseline Text: Neither party shall be liable...          │ │
│ │ Their Position: Counterparty typically pushes for...     │ │
│ │ Our Position: We maintain liability cap at...            │ │
│ ├──────────────────────────────────────────────────────────┤ │
│ │ Linked Playbook Topics:                         [+ Link] │ │
│ │ ┌────────────────────┐ ┌────────────────────┐            │ │
│ │ │ 📖 Limitation of   │ │ 📖 Consequential   │            │ │
│ │ │    Liability    [✕]│ │    Damages      [✕]│            │ │
│ │ └────────────────────┘ └────────────────────┘            │ │
│ └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

---

## Data Model Changes Required

### 1. Update TemplateClause Type

```typescript
export interface TemplateClause {
  id: string;
  clauseNumber: string;
  topic: string;
  baselineText: string;
  theirPosition: string;
  ourPosition: string;
  issue: string;
  rationale: string;
  impactCategory: string;
  impactSubcategory: string;
  
  // NEW: Link to playbook topics
  playbookTopicIds?: string[];
}
```

### 2. Add to Contract Clause (optional)

```typescript
export interface ClauseItem {
  // ... existing fields ...
  
  // NEW: Inherited from template, can be overridden
  playbookTopicIds?: string[];
}
```

### 3. Playbook State Management

```typescript
// In NegotiationContext or separate PlaybookContext
interface PlaybookState {
  topics: PlaybookTopic[];
  categories: string[]; // Derived list of unique categories
}

// Actions
addPlaybookTopic(topic: PlaybookTopic): void;
updatePlaybookTopic(id: string, updates: Partial<PlaybookTopic>): void;
deletePlaybookTopic(id: string): void;
```

---

## Implementation Phases

### Phase 1: Settings Tab (Minimal Viable)
- Add "Playbook Library" tab to Settings
- CRUD operations for playbook topics
- Categories derived from topics

### Phase 2: Template Linking
- Add `playbookTopicIds` to TemplateClause
- UI to link topics when editing template clauses
- Show linked topics in template preview

### Phase 3: Runtime Integration
- When viewing clause playbook, prioritize linked topics
- Visual distinction between linked and auto-matched topics
- Allow ad-hoc linking from contract clauses

### Phase 4: Advanced Features
- Duplicate playbook topic for customization
- Template-specific position overrides
- Playbook usage analytics

---

## Alternative Approaches Considered

### Approach A: Embedded Playbook in Templates (Rejected)
- Each template has its own copy of playbook
- Pros: Complete control, no cross-template dependencies
- Cons: Massive duplication, sync issues, maintenance nightmare

### Approach B: Playbook as Separate Module (Partial)
- Completely separate playbook management system
- Pros: Clean separation of concerns
- Cons: May feel disconnected from template workflow

### Approach C: AI-Suggested Playbook (Future Enhancement)
- Automatically suggest relevant playbook topics based on clause text
- Could use embeddings/semantic search
- Requires AI infrastructure

---

## Recommendation

**Implement Option A with Settings Tab** for Phase 1:

1. **Add Playbook Library tab in Settings Modal**
   - Users can create, edit, delete playbook topics
   - Organized by category with collapsible sections
   - Full CRUD for topics, positions, objections

2. **Keep current relatedClauseTypes matching**
   - Automatic matching still works as fallback
   - Low friction for users who don't want to configure

3. **Future: Add template linking in Phase 2**
   - Once playbook management is solid, add linking UI
   - Progressive enhancement approach

This approach:
- ✅ Low implementation complexity
- ✅ Builds on existing infrastructure
- ✅ Provides immediate value (playbook management)
- ✅ Sets foundation for template linking later
- ✅ Doesn't break current functionality
