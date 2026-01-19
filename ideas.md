# Contract Negotiation Tracker - Design Brainstorm

## Design Requirements Analysis
- Professional tool for legal/procurement teams
- Complex data visualization (tables, diffs, timelines)
- Glass-morphism aesthetic per PRD
- Semantic color coding (red, green, blue, purple)
- Must avoid: AI slop (violet gradients, centered layouts, Inter font, multicolor schemes)

---

<response>
## Idea 1: Corporate Brutalism

<text>
**Design Movement**: Neo-Brutalist Corporate — Raw, honest, utilitarian design that prioritizes function while maintaining visual interest through bold typography and stark contrasts.

**Core Principles**:
1. Unapologetic structure — Grid lines visible, no hiding the skeleton
2. Typography as architecture — Large, bold headings create visual hierarchy
3. Functional honesty — Every element serves a purpose, no decorative fluff
4. High contrast for scannability — Dark text on light backgrounds, clear delineation

**Color Philosophy**: 
- Primary: Deep charcoal (#1a1a1a) for authority and seriousness
- Background: Warm off-white (#f8f6f3) to soften the brutalist edges
- Accent: Burnt orange (#c45a2c) for actions and highlights — conveys urgency without alarm
- Status colors: Muted versions (sage green for agreed, slate blue for discussion, terracotta for blocked)
- Emotional intent: Conveys professionalism, trustworthiness, and no-nonsense efficiency

**Layout Paradigm**: 
- Asymmetric two-column master layout with fixed left sidebar (240px)
- Main content uses a strict 12-column grid with visible gutters
- Tables span full width with generous row heights
- Forms positioned in slide-out panels from the right edge

**Signature Elements**:
1. Thick black borders (3px) around interactive cards
2. Monospace numerals in tables for alignment
3. Oversized section labels rotated 90° on left margins

**Interaction Philosophy**: 
- Instant feedback — no waiting animations
- Click states with inverted colors (black → white)
- Hover reveals additional actions in-place, no tooltips

**Animation**: 
- Minimal, purposeful transitions (150ms max)
- Slide-in panels from edges (not center modals)
- No bouncing, no easing — linear movements only
- Tables sort with instant swap, no fade

**Typography System**:
- Headings: Space Grotesk Bold (700) — geometric, modern, authoritative
- Body: IBM Plex Sans Regular (400) — highly readable, technical feel
- Data/Tables: IBM Plex Mono — perfect alignment for numbers and codes
- Scale: 48px/32px/24px/18px/14px/12px
</text>

<probability>0.08</probability>
</response>

---

<response>
## Idea 2: Refined Legal Elegance

<text>
**Design Movement**: Contemporary Legal Minimalism — Inspired by high-end law firm branding, combining traditional gravitas with modern digital clarity.

**Core Principles**:
1. Restrained sophistication — Luxury through subtlety, not excess
2. Information density without clutter — Smart use of whitespace and hierarchy
3. Trust through consistency — Predictable patterns build confidence
4. Quiet confidence — Design that doesn't shout but commands respect

**Color Philosophy**:
- Primary: Deep navy (#0f2942) — traditional legal authority
- Background: Cool white (#fafbfc) with subtle warm undertones
- Accent: Antique gold (#b8860b) for premium highlights and CTAs
- Secondary: Slate gray (#64748b) for supporting text
- Status colors: Forest green (#2d5a3d) for agreed, Steel blue (#4a6fa5) for discussion, Burgundy (#7a2d3d) for blocked, Amber (#b5651d) for escalated
- Emotional intent: Establishes credibility, expertise, and meticulous attention to detail

**Layout Paradigm**:
- Centered content area with generous margins (max-width: 1400px)
- Persistent top navigation with contract context
- Collapsible left panel for filters and navigation
- Main workspace uses card-based sections with subtle shadows
- Modals centered with backdrop blur for focus

**Signature Elements**:
1. Thin gold accent lines as section dividers
2. Subtle paper texture overlay on cards (5% opacity)
3. Small caps for labels and metadata

**Interaction Philosophy**:
- Deliberate, considered interactions — confirm important actions
- Hover states reveal depth (shadow increase)
- Selected items highlighted with left border accent
- Progressive disclosure for complex forms

**Animation**:
- Smooth, dignified transitions (250-300ms)
- Fade-in for content appearance
- Subtle scale (1.02x) on card hover
- Modal slides up from bottom with backdrop fade
- Timeline events animate sequentially on load

**Typography System**:
- Headings: Playfair Display (600) — classic serif with modern proportions
- Body: Source Sans 3 (400/500) — humanist sans-serif, excellent readability
- Labels: Source Sans 3 Small Caps (600)
- Data: Tabular numerals from Source Sans 3
- Scale: 40px/28px/22px/16px/14px/12px
</text>

<probability>0.07</probability>
</response>

---

<response>
## Idea 3: Nordic Functional

<text>
**Design Movement**: Scandinavian Digital Design — Clean, functional, human-centered design inspired by Nordic design principles of simplicity and purpose.

**Core Principles**:
1. Clarity above all — Every pixel earns its place
2. Warm minimalism — Simple but not cold or sterile
3. Natural hierarchy — Information flows logically without forced emphasis
4. Accessible by default — High contrast, clear focus states, readable at all sizes

**Color Philosophy**:
- Primary: Deep forest (#1e3a2f) — grounded, natural, calming
- Background: Warm snow (#fefdfb) — soft white that's easy on eyes
- Accent: Copper (#b87333) — warm metallic for actions and highlights
- Surface: Light stone (#f5f3ef) — subtle warmth for cards
- Status colors: Moss green (#4a7c59) for agreed, Ocean blue (#3d6b8c) for discussion, Clay red (#9b4d4d) for blocked, Amber (#c4883a) for escalated
- Emotional intent: Creates calm focus, reduces cognitive load, promotes clear thinking

**Layout Paradigm**:
- Full-width header with contract switcher
- Three-zone layout: narrow left nav (200px), wide main content, contextual right panel (collapsible)
- Tables use alternating row backgrounds with generous padding
- Forms appear inline below table or in dedicated bottom section
- Dashboard stats in horizontal card row above table

**Signature Elements**:
1. Rounded corners (8px) on all containers for softness
2. Subtle inner shadows on input fields (inset depth)
3. Icon + text labels for all actions (never icon-only)

**Interaction Philosophy**:
- Gentle, guiding interactions — system helps user succeed
- Clear focus rings for keyboard navigation
- Inline editing with obvious edit mode indicators
- Drag handles visible on hover for reorderable items

**Animation**:
- Organic, natural-feeling motion (300-400ms with ease-out)
- Content fades and slides in from intended direction
- Micro-interactions: checkmarks animate on completion
- Skeleton loaders for async content
- Timeline draws progressively left-to-right

**Typography System**:
- Headings: DM Sans (600/700) — geometric but friendly
- Body: DM Sans (400/500) — consistent family for cohesion
- Monospace: JetBrains Mono — for clause numbers and diffs
- Scale: 36px/26px/20px/16px/14px/12px with generous line-heights (1.5-1.6)
</text>

<probability>0.06</probability>
</response>

---

## Selected Approach: Idea 2 - Refined Legal Elegance

This approach best fits the target users (legal counsel, contract managers, procurement teams) and the professional nature of contract negotiations. The design conveys authority and trustworthiness while maintaining modern usability. The navy/gold palette is distinctive without being trendy, and the typography choices balance tradition with digital clarity.
