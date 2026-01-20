# AI Agent Instructions: Implement 3-Text Negotiation Model

## Overview

Transform the contract negotiation tracker from a 2-text model (Original + Counter-Proposal) to a 3-text model that captures the complete negotiation lifecycle:

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   BASELINE   │ ──► │THEIR POSITION│ ──► │ OUR POSITION │
│   (start)    │     │  (received)  │     │  (we send)   │
└──────────────┘     └──────────────┘     └──────────────┘
```

---

## PHASE 1: Data Model Changes

### 1.1 Update Clause Item Schema

**Find** the clause/item data structure (likely named `ClauseItem`, `Item`, `Clause`, or similar).

**Replace** the existing text fields with the new 3-text structure:

```javascript
// OLD FIELDS (remove/rename):
// - clauseText / originalText
// - counterProposal / counterproposalWording

// NEW FIELDS:
{
  // === THE 3 TEXTS ===
  baselineText: string,      // Starting point - NEVER changes after creation
  theirPosition: string,     // Counterparty's current stance
  ourPosition: string,       // Our current stance
  
  // === METADATA (keep existing) ===
  issue: string,
  rationale: string,
  status: string,            // 'No Changes' | 'In Discussion' | 'Agreed' | 'Escalated' | 'Blocked'
  priority: string,          // 'Low' | 'Medium' | 'High'
  owner: string,
  riskLevel: string,         // 'low' | 'medium' | 'high' | 'critical'
  impactCategory: string,
  impactSubcategory: string,
  
  // === NEW: ROUND TRACKING ===
  currentRound: number,      // Default: 1
  
  // === UPDATED: VERSION HISTORY ===
  versions: [
    {
      id: string | number,
      round: number,
      label: string,           // e.g., "Round 1 - Initial Response"
      timestamp: string,       // ISO date
      baselineText: string,    // Snapshot
      theirPosition: string,   // Snapshot
      ourPosition: string,     // Snapshot
      status: string           // Status at that point
    }
  ]
}
```

### 1.2 Update Sample/Default Data

**Find** any sample data, mock data, or default values.

**Update** to use the new field names:

```javascript
// Example transformation:
{
  id: 1,
  clauseNumber: '8.1',
  
  // OLD:
  // clauseText: "Provider's liability shall not exceed...",
  // counterproposalWording: "Each party's liability shall not exceed...",
  
  // NEW:
  baselineText: "Provider's liability shall not exceed fees paid in the preceding 3 months.",
  theirPosition: "Provider's liability shall not exceed fees paid in the preceding 3 months.",  // Same as baseline initially for counterparty paper
  ourPosition: "Each party's liability shall not exceed fees paid in the preceding 12 months.",
  
  currentRound: 1,
  versions: [],
  
  // ... rest of fields unchanged
}
```

### 1.3 Update Storage Key (Optional but Recommended)

If using localStorage or similar persistence, consider incrementing the storage key version to avoid data conflicts:

```javascript
// OLD:
const STORAGE_KEY = 'negotiation_tracker_v2';

// NEW:
const STORAGE_KEY = 'negotiation_tracker_v3';
```

---

## PHASE 2: Form Changes (Add/Edit Clause)

### 2.1 Update Form State

**Find** the form component for adding/editing clauses.

**Update** the initial state and field mappings:

```javascript
// OLD:
const [formData, setFormData] = useState({
  clauseText: '',
  counterproposalWording: '',
  // ...
});

// NEW:
const [formData, setFormData] = useState({
  baselineText: '',
  theirPosition: '',
  ourPosition: '',
  currentRound: 1,
  // ...
});
```

### 2.2 Update Form Fields UI

**Replace** the 2 text fields with 3 text fields. Add contextual labels based on paper source.

**Find** the parent contract's `paperSource` value ('ours' | 'counterparty') and pass it to the form.

```jsx
// Dynamic labels based on paper source
const getFieldLabels = (paperSource) => {
  if (paperSource === 'ours') {
    return {
      baseline: 'Our Template (Original Language)',
      theirs: 'Their Markup (What They Changed)',
      ours: 'Our Response (Accept/Reject/Counter)'
    };
  } else {
    return {
      baseline: 'Their Contract (Original Language)',
      theirs: 'Their Position (Latest Response)',
      ours: 'Our Redlines (What We Want)'
    };
  }
};

const labels = getFieldLabels(paperSource);

// Render 3 text areas:
<>
  {/* BASELINE TEXT */}
  <div>
    <label>{labels.baseline}</label>
    <textarea
      value={formData.baselineText}
      onChange={(e) => setFormData({...formData, baselineText: e.target.value})}
      placeholder="Paste the original/starting contract language here..."
      rows={3}
    />
    {isEditing && (
      <p className="text-sm text-gray-500">
        ⚠️ Baseline should rarely change after initial creation
      </p>
    )}
  </div>

  {/* THEIR POSITION */}
  <div>
    <label>{labels.theirs}</label>
    <textarea
      value={formData.theirPosition}
      onChange={(e) => setFormData({...formData, theirPosition: e.target.value})}
      placeholder="Paste counterparty's proposed/marked-up language..."
      rows={3}
    />
    {paperSource === 'counterparty' && formData.currentRound === 1 && (
      <div className="flex items-center gap-2 mt-1">
        <input
          type="checkbox"
          checked={formData.theirPosition === formData.baselineText}
          onChange={(e) => {
            if (e.target.checked) {
              setFormData({...formData, theirPosition: formData.baselineText});
            }
          }}
        />
        <span className="text-sm">Awaiting their response (same as baseline)</span>
      </div>
    )}
  </div>

  {/* OUR POSITION */}
  <div>
    <label>{labels.ours}</label>
    <textarea
      value={formData.ourPosition}
      onChange={(e) => setFormData({...formData, ourPosition: e.target.value})}
      placeholder="Enter our proposed language / response..."
      rows={3}
    />
  </div>

  {/* ROUND INDICATOR */}
  <div>
    <label>Current Round</label>
    <input
      type="number"
      min={1}
      value={formData.currentRound}
      onChange={(e) => setFormData({...formData, currentRound: parseInt(e.target.value) || 1})}
    />
  </div>
</>
```

### 2.3 Form Validation

```javascript
const validateForm = (formData, paperSource) => {
  const errors = [];
  
  if (!formData.baselineText?.trim()) {
    errors.push('Baseline text is required');
  }
  
  if (!formData.ourPosition?.trim()) {
    errors.push('Our position is required');
  }
  
  // Their position can be empty/same as baseline in Round 1 of counterparty paper
  if (paperSource === 'ours' && !formData.theirPosition?.trim()) {
    errors.push('Their markup is required when using our paper');
  }
  
  return errors;
};
```

---

## PHASE 3: Comparison/Diff Modal Changes

### 3.1 Update Diff View to Support 3-Way Comparison

**Find** the comparison modal or diff view component.

**Add** tabs or dropdown to select which texts to compare:

```jsx
const DIFF_PAIRS = [
  { id: 'baseline-theirs', label: 'Baseline ↔ Theirs', left: 'baselineText', right: 'theirPosition' },
  { id: 'theirs-ours', label: 'Theirs ↔ Ours', left: 'theirPosition', right: 'ourPosition' },
  { id: 'baseline-ours', label: 'Baseline ↔ Ours', left: 'baselineText', right: 'ourPosition' },
];

const [activeDiffPair, setActiveDiffPair] = useState('theirs-ours');

// Get the active pair config
const currentPair = DIFF_PAIRS.find(p => p.id === activeDiffPair);
const leftText = item[currentPair.left];
const rightText = item[currentPair.right];

// Render tabs
<div className="diff-tabs">
  {DIFF_PAIRS.map(pair => (
    <button
      key={pair.id}
      onClick={() => setActiveDiffPair(pair.id)}
      className={activeDiffPair === pair.id ? 'active' : ''}
    >
      {pair.label}
    </button>
  ))}
</div>

// Render diff
<DiffView 
  original={leftText} 
  modified={rightText}
  leftLabel={getLabelForField(currentPair.left, paperSource)}
  rightLabel={getLabelForField(currentPair.right, paperSource)}
/>
```

### 3.2 Smart Default Tab Selection

```javascript
const getDefaultDiffPair = (paperSource, currentRound, theirPosition, baselineText) => {
  // If counterparty paper AND round 1 AND their position equals baseline
  // Show Baseline ↔ Ours (what we're requesting)
  if (paperSource === 'counterparty' && currentRound === 1 && theirPosition === baselineText) {
    return 'baseline-ours';
  }
  
  // Otherwise show the active negotiation: Theirs ↔ Ours
  return 'theirs-ours';
};
```

### 3.3 Three-Panel View Option (Optional Enhancement)

```jsx
// Optional: Show all 3 texts side by side
const ThreePanelView = ({ item, paperSource }) => {
  const labels = getFieldLabels(paperSource);
  
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="panel">
        <h4>{labels.baseline}</h4>
        <p>{item.baselineText}</p>
      </div>
      <div className="panel">
        <h4>{labels.theirs}</h4>
        <p>{item.theirPosition}</p>
        {item.theirPosition === item.baselineText && (
          <span className="badge">Unchanged</span>
        )}
      </div>
      <div className="panel">
        <h4>{labels.ours}</h4>
        <p>{item.ourPosition}</p>
      </div>
    </div>
  );
};
```

---

## PHASE 4: Version History Changes

### 4.1 Update Save Version Function

```javascript
const saveVersion = (itemId, label) => {
  const item = getCurrentItem(itemId);
  
  const newVersion = {
    id: generateId(),
    round: item.currentRound,
    label: label || `Round ${item.currentRound}`,
    timestamp: new Date().toISOString(),
    // Snapshot all 3 texts
    baselineText: item.baselineText,
    theirPosition: item.theirPosition,
    ourPosition: item.ourPosition,
    status: item.status
  };
  
  // Add to versions array
  updateItem(itemId, {
    versions: [...(item.versions || []), newVersion]
  });
};
```

### 4.2 Update Version Display

```jsx
const VersionHistoryPanel = ({ versions, onRestore }) => {
  return (
    <div className="version-history">
      {versions.map((version) => (
        <div key={version.id} className="version-card">
          <div className="version-header">
            <span className="round-badge">Round {version.round}</span>
            <span className="label">{version.label}</span>
            <span className="timestamp">{formatDate(version.timestamp)}</span>
            <span className="status-badge">{version.status}</span>
          </div>
          
          <div className="version-texts">
            <div>
              <strong>Baseline:</strong>
              <p className="truncate">{version.baselineText?.substring(0, 100)}...</p>
            </div>
            <div>
              <strong>Their Position:</strong>
              <p className="truncate">{version.theirPosition?.substring(0, 100)}...</p>
            </div>
            <div>
              <strong>Our Position:</strong>
              <p className="truncate">{version.ourPosition?.substring(0, 100)}...</p>
            </div>
          </div>
          
          <button onClick={() => onRestore(version)}>
            Restore This Version
          </button>
        </div>
      ))}
    </div>
  );
};
```

### 4.3 Restore Version Function

```javascript
const restoreVersion = (itemId, version) => {
  // Restore the 3 texts from the version snapshot
  // But increment the round (we're starting a new round from old state)
  updateItem(itemId, {
    theirPosition: version.theirPosition,
    ourPosition: version.ourPosition,
    // Note: Don't restore baselineText - it should never change
    // currentRound stays the same or increments based on your preference
  });
};
```

---

## PHASE 5: Table Display Changes

### 5.1 Update Column Definitions

```javascript
const COLUMNS = [
  { id: 'clauseNumber', label: 'Clause #', visible: true },
  { id: 'issue', label: 'Issue', visible: true },
  { id: 'round', label: 'Round', visible: true },           // NEW
  { id: 'baseline', label: 'Baseline', visible: false },    // NEW (optional)
  { id: 'theirPosition', label: 'Their Position', visible: false }, // NEW (optional)
  { id: 'ourPosition', label: 'Our Position', visible: false },     // NEW (optional)
  { id: 'status', label: 'Status', visible: true },
  { id: 'priority', label: 'Priority', visible: true },
  { id: 'owner', label: 'Owner', visible: true },
  { id: 'risk', label: 'Risk', visible: true },
  { id: 'actions', label: '', visible: true },
];
```

### 5.2 Update Table Row Rendering

```jsx
// Add rendering for new columns
{col.id === 'round' && (
  <span className="round-badge">R{item.currentRound}</span>
)}

{col.id === 'baseline' && (
  <span className="text-truncate" title={item.baselineText}>
    {item.baselineText?.substring(0, 50)}...
  </span>
)}

{col.id === 'theirPosition' && (
  <span className="text-truncate" title={item.theirPosition}>
    {item.theirPosition === item.baselineText ? (
      <em className="text-gray-400">= Baseline</em>
    ) : (
      item.theirPosition?.substring(0, 50) + '...'
    )}
  </span>
)}

{col.id === 'ourPosition' && (
  <span className="text-truncate" title={item.ourPosition}>
    {item.ourPosition?.substring(0, 50)}...
  </span>
)}
```

### 5.3 Add Visual Diff Indicator (Optional)

```jsx
// Show a mini indicator of how much has changed
const DiffIndicator = ({ baseline, theirs, ours }) => {
  const baselineTheirsSame = baseline === theirs;
  const theirsOursSame = theirs === ours;
  const baselineOursSame = baseline === ours;
  
  if (theirsOursSame) {
    return <span className="badge green">Aligned</span>;
  }
  
  if (baselineOursSame && !baselineTheirsSame) {
    return <span className="badge yellow">They Changed</span>;
  }
  
  return <span className="badge blue">In Negotiation</span>;
};
```

---

## PHASE 6: New Round Workflow

### 6.1 Add "New Round" Button/Action

```jsx
const startNewRound = (itemId) => {
  const item = getCurrentItem(itemId);
  
  // Auto-save current state as a version
  saveVersion(itemId, `Round ${item.currentRound} - Auto-saved`);
  
  // Increment round
  updateItem(itemId, {
    currentRound: item.currentRound + 1
  });
  
  // Optionally prompt user to update theirPosition with new response
  showToast('New round started. Update "Their Position" with their latest response.');
};

// In the UI (comparison modal or table row actions)
<button onClick={() => startNewRound(item.id)}>
  Start New Round
</button>
```

### 6.2 Round-Aware UI Hints

```jsx
// Show contextual hints based on round and paper source
const getRoundHint = (paperSource, round, theirPosition, baselineText) => {
  if (paperSource === 'counterparty' && round === 1) {
    return 'Round 1: Send your initial redlines. "Their Position" will update when they respond.';
  }
  
  if (paperSource === 'ours' && round === 1) {
    return 'Round 1: Review their markup and prepare your response.';
  }
  
  if (round > 1) {
    return `Round ${round}: Review their latest position and update your response.`;
  }
  
  return '';
};
```

---

## PHASE 7: Export Changes

### 7.1 Update JSON Export

```javascript
const exportToJSON = () => {
  const data = {
    contracts: contracts.map(contract => ({
      ...contract,
      items: contract.items.map(item => ({
        ...item,
        // Ensure new fields are included
        baselineText: item.baselineText,
        theirPosition: item.theirPosition,
        ourPosition: item.ourPosition,
        currentRound: item.currentRound,
        versions: item.versions
      }))
    })),
    exportedAt: new Date().toISOString(),
    version: '3.0'  // Increment version
  };
  
  downloadJSON(data, 'negotiation-export.json');
};
```

### 7.2 Update CSV Export

```javascript
const exportToCSV = () => {
  const headers = [
    'Clause #',
    'Issue',
    'Round',
    'Status',
    'Priority',
    'Owner',
    'Risk',
    'Baseline Text',
    'Their Position', 
    'Our Position'
  ];
  
  const rows = items.map(item => [
    item.clauseNumber,
    `"${item.issue}"`,
    item.currentRound,
    item.status,
    item.priority,
    item.owner,
    item.riskLevel,
    `"${item.baselineText?.replace(/"/g, '""')}"`,
    `"${item.theirPosition?.replace(/"/g, '""')}"`,
    `"${item.ourPosition?.replace(/"/g, '""')}"`
  ]);
  
  downloadCSV([headers, ...rows], 'clauses-export.csv');
};
```

---

## PHASE 8: Migration (If Existing Data)

### 8.1 Data Migration Function

If the app has existing data in the old format, add a migration:

```javascript
const migrateToV3 = (oldData) => {
  return {
    ...oldData,
    items: oldData.items.map(item => ({
      ...item,
      
      // Map old fields to new fields
      baselineText: item.clauseText || item.originalText || '',
      theirPosition: item.clauseText || item.originalText || '',  // Default to baseline
      ourPosition: item.counterproposalWording || item.counterProposal || '',
      
      // Add new fields with defaults
      currentRound: 1,
      versions: item.versions || [],
      
      // Remove old fields (optional, or keep for backwards compat)
      // clauseText: undefined,
      // counterproposalWording: undefined,
    }))
  };
};

// Run on app init if needed
useEffect(() => {
  const storedData = localStorage.getItem(STORAGE_KEY);
  if (storedData) {
    const parsed = JSON.parse(storedData);
    if (!parsed.version || parsed.version < 3) {
      const migrated = migrateToV3(parsed);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({...migrated, version: 3}));
    }
  }
}, []);
```

---

## PHASE 9: Testing Checklist

After implementation, verify these scenarios:

### Scenario A: Our Paper
- [ ] Create contract with "Our Paper" selected
- [ ] Add clause: Enter baseline (our template), their markup, our response
- [ ] Verify diff shows Baseline ↔ Theirs correctly
- [ ] Verify diff shows Theirs ↔ Ours correctly
- [ ] Save a version
- [ ] Start new round
- [ ] Update their position with new response
- [ ] Verify version history shows all 3 texts

### Scenario B: Counterparty Paper
- [ ] Create contract with "Counterparty Paper" selected
- [ ] Add clause: Enter baseline (their contract), their position = baseline, our redlines
- [ ] Verify "Their Position = Baseline" hint/checkbox works
- [ ] Verify default diff is Baseline ↔ Ours
- [ ] Save version
- [ ] Start Round 2, update their position with their response
- [ ] Verify diff now shows Theirs ↔ Ours as primary

### General
- [ ] Form validation works correctly
- [ ] Export JSON includes all 3 texts
- [ ] Export CSV includes all 3 texts
- [ ] Column visibility toggle works for new columns
- [ ] Migration doesn't break existing data
- [ ] Version restore works correctly

---

## Summary of Field Mappings

| Old Field | New Field | Notes |
|-----------|-----------|-------|
| `clauseText` | `baselineText` | Rename, immutable after creation |
| `originalText` | `baselineText` | Alias, same as above |
| *(new)* | `theirPosition` | Counterparty's current stance |
| `counterproposalWording` | `ourPosition` | Rename |
| `counterProposal` | *(keep or remove)* | Was summary, can keep as `issue` |
| *(new)* | `currentRound` | Track negotiation rounds |

---

## Files Likely to Modify

1. **Data/Types file** - Schema definitions
2. **Main App component** - State management
3. **Form component** - Add/Edit clause form
4. **Table component** - Column definitions and rendering
5. **Modal component** - Comparison/Diff view
6. **Version History component** - Display and restore
7. **Export functions** - JSON and CSV
8. **Sample data** - Update mock data
9. **Storage/persistence** - Migration logic

---

## Estimated Effort

| Phase | Complexity | Estimated Time |
|-------|------------|----------------|
| Phase 1: Data Model | Low | 15-30 min |
| Phase 2: Form Changes | Medium | 30-45 min |
| Phase 3: Diff Modal | Medium | 30-45 min |
| Phase 4: Version History | Low | 15-30 min |
| Phase 5: Table Display | Low | 15-30 min |
| Phase 6: New Round | Low | 15-30 min |
| Phase 7: Export | Low | 15 min |
| Phase 8: Migration | Medium | 20-30 min |
| Phase 9: Testing | Medium | 30-45 min |
| **Total** | | **3-5 hours** |
