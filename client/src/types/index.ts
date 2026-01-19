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

export interface ClauseVersion {
  id: string;
  clauseItemId: number;
  label: string;
  
  // Round tracking for multi-round negotiations
  round?: number;              // Negotiation round number (1, 2, 3...)
  party?: NegotiationParty;    // Who made this version
  
  // Snapshot of all negotiable fields
  clauseText: string;
  proposedChange?: string;     // What they proposed to change
  counterProposal?: string;    // Our response summary
  counterproposalWording: string;
  
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

export interface ClauseItem {
  id: number;
  clauseNumber: string;
  clauseText: string;
  topic: string; // Topic/category of the clause
  issue: string; // Specific issue being negotiated
  proposedChange: string;
  counterProposal: string;
  counterproposalWording: string;
  status: ClauseStatus;
  priority: Priority;
  owner: string;
  impactCategory: string;
  impactSubcategory: string;
  riskLevel: RiskLevel;
  templateId?: string;
  templateClauseId?: string;
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

export interface TemplateClause {
  id: string;
  clauseNumber: string;
  topic: string;
  clauseText: string;
  issue: string;
  rationale: string;
  proposedChange: string;
  counterProposal: string;
  counterproposalWording: string;
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
