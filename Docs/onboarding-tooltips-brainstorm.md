# First-Time User Onboarding - Brainstorm Document

## Executive Summary

This document explores options for implementing a first-time user onboarding experience with explanatory tooltips that guide new users through the app's key features. The goal is to reduce confusion, increase feature adoption, and provide a welcoming first impression.

---

## Option A: Guided Tour with Step-by-Step Tooltips

### Concept
A sequential walkthrough that appears on first visit, highlighting key UI elements one by one with explanatory popover tooltips.

### Implementation Ideas

1. **Welcome Modal** (Step 0)
   - Brief intro: "Welcome to Contract Negotiation Tracker!"
   - Option to "Take a Tour" or "Skip for now"
   - Show sample data is pre-loaded for exploration

2. **Tour Steps** (Sequential tooltips with Next/Back/Skip)
   - **Step 1: Header / Contract Switcher**
     - "Switch between contracts or create new ones from here"
   - **Step 2: Dashboard Stats Cards**
     - "Click any status card to filter clauses by that status"
   - **Step 3: Timeline**
     - "Track your negotiation journey with milestones and notes"
   - **Step 4: Clause Table**
     - "View, edit, and manage all your contract clauses"
   - **Step 5: Add Clause Button**
     - "Add new clauses with baseline text and negotiation positions"
   - **Step 6: Comparison/Diff**
     - "Compare original and proposed text with visual diff highlighting"
   - **Step 7: Playbook**
     - "Access negotiation guidance with positions and fallbacks"
   - **Step 8: Settings**
     - "Customize columns, categories, and templates"

### Pros
- Very guided, beginner-friendly
- Ensures users see all major features
- Can track completion for analytics

### Cons
- Can feel forced/intrusive
- Some users may skip entirely
- Needs maintenance when UI changes

### Libraries to Consider
- **react-joyride** - Popular guided tour library
- **shepherd.js** - Flexible step-by-step tours
- **intro.js** - Simple and lightweight
- **driver.js** - Modern, customizable

---

## Option B: Contextual "First-Time" Tooltips

### Concept
Instead of a linear tour, show contextual tooltips the first time a user encounters each feature. Tooltips appear once and are dismissible.

### Implementation Ideas

1. **localStorage Tracking**
   - Track which tips have been shown: `{ "tip-dashboard-filter": true, ... }`
   
2. **Contextual Triggers**
   - First time viewing Dashboard Stats → Tooltip: "💡 Click status cards to filter"
   - First time opening Clause Table → Tooltip: "💡 Right-click rows for quick actions"
   - First time seeing empty contract → Tooltip: "💡 Start by adding your first clause"
   - First time clicking Compare → Tooltip: "💡 Green = additions, Red = removals"

3. **Visual Design**
   - Small floating tooltip with arrow pointing to relevant element
   - "Got it" button to dismiss
   - "Don't show tips" option to disable all

### Pros
- Less intrusive - tips appear in context
- Users learn as they explore
- More natural discovery pattern

### Cons
- May miss important features if user doesn't explore
- No structured learning path
- Can be annoying if too many tips

---

## Option C: Floating Help Widget + Feature Discovery Checklist

### Concept
A persistent help button (?) that opens a sidebar or modal with:
- Feature discovery checklist
- Quick tips for each area
- Link to documentation

### Implementation Ideas

1. **Help Button (FAB)**
   - Floating action button in corner
   - Badge with number of undiscovered features
   
2. **Discovery Checklist**
   - ☐ Create your first contract
   - ☐ Add a clause with baseline text
   - ☐ Use the comparison tool
   - ☐ Filter clauses by status
   - ☐ Add a timeline note
   - ☐ View negotiation playbook
   
3. **Progress Indicator**
   - "You've discovered 3/8 features!"
   - Gamification element for engagement

### Pros
- Non-intrusive, user-driven
- Always accessible for reference
- Gamification encourages exploration

### Cons
- Users may ignore the help button
- Less direct than guided tour
- Requires more user initiative

---

## Option D: Empty State Feature Cards (Enhanced Current Approach)

### Concept
Build on the existing EmptyState component to make feature cards interactive and educational.

### Implementation Ideas

1. **Interactive Feature Cards**
   - Current cards show features but aren't clickable
   - Make them actionable: "Try it now" buttons
   
2. **Demo Mode**
   - "See how it works" button plays a small animation/video
   - Or opens a demo modal showing the feature
   
3. **Quick Start Wizard**
   - "Create your first contract" guided flow
   - Pre-filled example data option
   - Step-by-step clause addition

### Pros
- Works with existing UI pattern
- Respects current design language
- Good for complete beginners

### Cons
- Only visible when no contract selected
- Doesn't help with in-app discovery
- Limited to initial state

---

## Option E: Inline Hints with "Learn More" Expansion

### Concept
Subtle inline hints integrated into the UI that expand on demand.

### Implementation Ideas

1. **Inline Hint Text**
   - Light gray text near key elements
   - "Click a status card to filter ↗"
   - Disappears after first use
   
2. **Info Icons (ℹ️)**
   - Small info icons next to complex features
   - Hover/click reveals tooltip with explanation
   
3. **Collapsible "Tips" Section**
   - At top of each section: "💡 Tips" expandable
   - Lists 2-3 quick tips for that area

### Pros
- Very subtle, doesn't interrupt
- Always available as reference
- Fits naturally into UI

### Cons
- Easy to overlook
- May not be enough for complete beginners
- Requires careful placement

---

## Recommended Hybrid Approach

### Combine Best Elements

1. **First Visit: Welcome Modal**
   - Show on very first visit (localStorage flag)
   - "Welcome to Contract Negotiation Tracker!"
   - Two buttons: "Take a Quick Tour" / "Explore on My Own"
   
2. **Optional Guided Tour**
   - If user chooses "Take a Tour" → react-joyride tour (5-6 steps max)
   - If user skips → show contextual tips instead
   
3. **Persistent Discovery**
   - Floating "?" help button
   - Discovery checklist with progress
   - "Show tips" toggle in settings
   
4. **Contextual First-Use Tips**
   - Show once per feature area
   - Dismissible with "Got it"
   - Track in localStorage

---

## Tooltip Content Suggestions

### Dashboard Stats
> **Status Cards are Clickable!**  
> Click any status card to filter the clause list. Click "Total Clauses" to see all. Press Esc to clear the filter.

### Clause Table
> **Quick Actions Menu**  
> Right-click any row for quick actions like Edit, Compare, View Playbook, or Delete.

### Comparison Modal
> **Understanding the Diff View**  
> Green highlights show additions. Red with strikethrough shows removals. Toggle between "Baseline", "Their Position", and "Our Position".

### Timeline
> **Track Your Progress**  
> Add notes and milestones to document the negotiation journey. Great for handoffs and audits.

### Add Clause Form
> **The Three Text Fields**  
> - **Baseline**: Original contract text  
> - **Their Position**: Counterparty's proposed changes  
> - **Our Position**: Your preferred language

### Playbook
> **Negotiation Guidance**  
> Access suggested positions, fallback options, and redlines for each clause type.

### Templates
> **Save Time with Templates**  
> Create templates from frequently used clauses. Apply them to new contracts instantly.

### Settings
> **Customize Your Workspace**  
> Show/hide columns, manage impact categories, create custom templates, and export/import data.

---

## Technical Implementation Notes

### State Management
```typescript
interface OnboardingState {
  hasSeenWelcome: boolean;
  hasCompletedTour: boolean;
  dismissedTips: string[];
  discoveredFeatures: string[];
}

const ONBOARDING_STORAGE_KEY = 'negotiation-tracker-onboarding';
```

### Tip Component Pattern
```tsx
interface TipProps {
  id: string;
  trigger: ReactNode;
  content: ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

function FirstTimeTip({ id, trigger, content, placement }: TipProps) {
  // Check localStorage if already dismissed
  // Show tooltip if first time
  // Save to localStorage on dismiss
}
```

### Reset Mechanism
- Add "Reset Onboarding Tips" button in Settings
- Clears all localStorage flags
- Allows users to re-experience the tour

---

## Decision Points for User

1. **Tour Style**: Guided sequential vs. contextual on-demand?
2. **Welcome Modal**: Required or optional?
3. **Help Widget**: Floating button or menu item?
4. **Gamification**: Progress tracking or simple tips?
5. **Timing**: Show tips immediately or after brief delay?
6. **Mobile**: Same experience or simplified?

---

## Effort Estimates

| Option | Complexity | Time Estimate |
|--------|------------|---------------|
| A: Guided Tour (react-joyride) | Medium | 4-6 hours |
| B: Contextual Tips | Low-Medium | 3-4 hours |
| C: Help Widget + Checklist | Medium-High | 6-8 hours |
| D: Enhanced Empty State | Low | 2-3 hours |
| E: Inline Hints | Low | 2-3 hours |
| **Hybrid Approach** | Medium-High | 8-12 hours |

---

## Next Steps

1. User reviews options and selects preferred approach
2. Design mockups for chosen option
3. Implement core onboarding infrastructure
4. Write tooltip content for each feature
5. Test with fresh localStorage to simulate new user
6. Add "Reset Onboarding" option in Settings
