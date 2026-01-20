// Contract Negotiation Tracker - Type Definitions
// Design: Refined Legal Elegance

export type PaperSource = 'ours' | 'counterparty';
export type BallInCourt = 'us' | 'them';
export type ContractStatus = 'active' | 'completed' | 'archived';
export type ClauseStatus = 'No Changes' | 'In Discussion' | 'Agreed' | 'Escalated' | 'Blocked';
export type Priority = 'Low' | 'Medium' | 'High';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface TimelineEvent {
  id: number;
  type: string;
  description: string;
  date: string; // ISO8601
  timestamp: string; // ISO8601
  notes?: string; // Additional notes for the event
}

// Party who made this version in negotiation
export type NegotiationParty = 'us' | 'them' | 'original';

/**
 * 3-Text Model Version Snapshot
 * Captures the state of all 3 texts at a point in time
 */
export interface ClauseVersion {
  id: string;
  clauseItemId: number;
  label: string;
  
  // Round tracking for multi-round negotiations
  round?: number;              // Negotiation round number (1, 2, 3...)
  party?: NegotiationParty;    // Who made this version
  
  // ===== THE 3 TEXTS SNAPSHOT =====
  baselineText: string;        // Starting point snapshot
  theirPosition: string;       // Their position at this round
  ourPosition: string;         // Our position at this round
  
  // State at this point
  status?: ClauseStatus;
  timestamp: string;
  notes?: string;              // Optional notes about this round
}

export interface Annotation {
  id: string;
  clauseItemId: number;
  versionId?: string;
  text: string;
  type: 'note' | 'question' | 'important';
  position?: { start: number; end: number };
  timestamp: string;
}

/**
 * 3-Text Model Clause Item
 * 
 * The 3 core texts:
 * - baselineText: Starting point (rarely changes after creation)
 * - theirPosition: Counterparty's current proposed text
 * - ourPosition: Our current proposed text/response
 * 
 * For "Our Paper": Baseline = Our template, Theirs = Their markup, Ours = Our response
 * For "Their Paper": Baseline = Their contract, Theirs = Their stance, Ours = Our redlines
 */
export interface ClauseItem {
  id: number;
  clauseNumber: string;
  topic: string;                // Topic/category of the clause
  
  // ===== THE 3 TEXTS (Core of negotiation) =====
  baselineText: string;         // Starting point - rarely changes
  theirPosition: string;        // Their current proposed text
  ourPosition: string;          // Our current proposed text/response
  
  // ===== HUMAN-READABLE CONTEXT =====
  issue: string;                // What's being negotiated (summary)
  rationale?: string;           // Why we're taking our position
  
  // ===== ROUND & STATE =====
  currentRound?: number;        // Current negotiation round (default: 1)
  status: ClauseStatus;
  priority: Priority;
  owner: string;
  
  // ===== RISK & IMPACT =====
  riskLevel: RiskLevel;
  impactCategory: string;
  impactSubcategory: string;
  
  // ===== TEMPLATE REFERENCE =====
  templateId?: string;
  templateClauseId?: string;
  
  // ===== HISTORY =====
  versions?: ClauseVersion[];
  annotations?: Annotation[];
}

export interface Contract {
  id: number;
  name: string;
  counterparty: string;
  description: string;
  status: ContractStatus;
  paperSource: PaperSource;
  ballInCourt: BallInCourt;
  createdAt: string;
  updatedAt: string;
  items: ClauseItem[];
  timeline: TimelineEvent[];
}

/**
 * 3-Text Model Template Clause
 */
export interface TemplateClause {
  id: string;
  clauseNumber: string;
  topic: string;
  
  // ===== THE 3 TEXTS =====
  baselineText: string;         // Template's default text
  theirPosition: string;        // Expected counterparty position
  ourPosition: string;          // Our standard counter-position
  
  // ===== CONTEXT =====
  issue: string;                // What this clause typically negotiates
  rationale: string;            // Why we take this position
  
  // ===== IMPACT =====
  impactCategory: string;
  impactSubcategory: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  clauses: TemplateClause[];
  createdAt: string;
  updatedAt: string;
}

export interface PlaybookPosition {
  id: string;
  position: string;
  proposedChange: string;
  fallback?: string;
  redline?: string;
}

export interface PlaybookTopic {
  id: string;
  category: string;
  title: string;
  description: string;
  commonObjections: string[];
  positions: PlaybookPosition[];
  relatedClauseTypes: string[];
}

export interface ImpactCategory {
  id: string;
  name: string;
  subcategories: string[];
  color?: string;
}

export interface ColumnConfig {
  id: string;
  label: string;
  visible: boolean;
  width?: number;
  order: number;
}

export interface FormOptions {
  statuses: ClauseStatus[];
  priorities: Priority[];
  owners: string[];
  riskLevels: RiskLevel[];
}

export interface DiffWord {
  text: string;
  type: 'added' | 'removed' | 'unchanged';
}

export interface FilterState {
  search: string;
  status: ClauseStatus | 'all';
  priority: Priority | 'all';
  owner: string | 'all';
  impactCategory: string | 'all';
  riskLevel: RiskLevel | 'all';
}

export interface SortState {
  column: keyof ClauseItem | null;
  direction: 'asc' | 'desc';
}
