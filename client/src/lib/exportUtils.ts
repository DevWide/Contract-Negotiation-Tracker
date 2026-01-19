// Contract Negotiation Tracker - Export Utilities
// CSV and JSON export functionality

import type { Contract, ClauseItem, Template } from '@/types';

/**
 * Escape CSV field value
 */
function escapeCSV(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Export clauses to CSV format
 */
export function exportToCSV(contract: Contract): string {
  const headers = [
    'Clause Number',
    'Issue/Topic',
    'Original Text',
    'Proposed Change',
    'Counter-Proposal',
    'Counter-Proposal Wording',
    'Status',
    'Priority',
    'Owner',
    'Impact Category',
    'Impact Subcategory',
    'Risk Level',
  ];

  const rows = contract.items.map(item => [
    escapeCSV(item.clauseNumber),
    escapeCSV(item.issue),
    escapeCSV(item.clauseText),
    escapeCSV(item.proposedChange),
    escapeCSV(item.counterProposal),
    escapeCSV(item.counterproposalWording),
    escapeCSV(item.status),
    escapeCSV(item.priority),
    escapeCSV(item.owner),
    escapeCSV(item.impactCategory),
    escapeCSV(item.impactSubcategory),
    escapeCSV(item.riskLevel),
  ]);

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}

/**
 * Export contract to JSON format
 */
export function exportToJSON(contract: Contract): string {
  return JSON.stringify(contract, null, 2);
}

/**
 * Export all contracts to JSON format
 */
export function exportAllToJSON(contracts: Contract[]): string {
  return JSON.stringify({ contracts, exportedAt: new Date().toISOString() }, null, 2);
}

/**
 * Download file to user's device
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Parse CSV content to clause items
 */
export function parseCSV(content: string): Partial<ClauseItem>[] {
  const lines = content.split(/\r?\n/).filter(line => line.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const items: Partial<ClauseItem>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const item: Partial<ClauseItem> = {};

    headers.forEach((header, index) => {
      const value = values[index]?.trim() || '';
      switch (header) {
        case 'clause number':
          item.clauseNumber = value;
          break;
        case 'issue/topic':
        case 'issue':
          item.issue = value;
          break;
        case 'original text':
        case 'clause text':
          item.clauseText = value;
          break;
        case 'proposed change':
        case 'rationale': // Legacy support
          item.proposedChange = value;
          break;
        case 'counter-proposal':
        case 'counterproposal':
          item.counterProposal = value;
          break;
        case 'counter-proposal wording':
        case 'counterproposal wording':
          item.counterproposalWording = value;
          break;
        case 'status':
          item.status = value as ClauseItem['status'];
          break;
        case 'priority':
          item.priority = value as ClauseItem['priority'];
          break;
        case 'owner':
          item.owner = value;
          break;
        case 'impact category':
          item.impactCategory = value;
          break;
        case 'impact subcategory':
          item.impactSubcategory = value;
          break;
        case 'risk level':
          item.riskLevel = value as ClauseItem['riskLevel'];
          break;
      }
    });

    if (item.clauseNumber || item.issue || item.clauseText) {
      items.push(item);
    }
  }

  return items;
}

/**
 * Parse a single CSV line handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
  }
  result.push(current);

  return result;
}

/**
 * Generate filename with timestamp
 */
export function generateFilename(baseName: string, extension: string): string {
  const timestamp = new Date().toISOString().slice(0, 10);
  const safeName = baseName.replace(/[^a-zA-Z0-9]/g, '_');
  return `${safeName}_${timestamp}.${extension}`;
}

/**
 * Export template to CSV format (includes playbook data)
 */
export function exportTemplateToCSV(template: Template): string {
  const headers = [
    'Clause Number',
    'Issue/Topic',
    'Clause Text',
    'Proposed Change',
    'Counter-Proposal',
    'Counter-Proposal Wording',
    'Impact Category',
    'Impact Subcategory',
  ];

  const rows = template.clauses.map(clause => [
    escapeCSV(clause.clauseNumber),
    escapeCSV(clause.issue),
    escapeCSV(clause.clauseText),
    escapeCSV(clause.proposedChange),
    escapeCSV(clause.counterProposal),
    escapeCSV(clause.counterproposalWording),
    escapeCSV(clause.impactCategory),
    escapeCSV(clause.impactSubcategory),
  ]);

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}

/**
 * Export template to JSON format
 */
export function exportTemplateToJSON(template: Template): string {
  return JSON.stringify(template, null, 2);
}

/**
 * Export all data (contracts and templates) to JSON format
 */
export function exportAllDataToJSON(contracts: Contract[], templates: Template[]): string {
  return JSON.stringify({
    contracts,
    templates,
    exportedAt: new Date().toISOString(),
    version: '1.0'
  }, null, 2);
}

/**
 * Parse template CSV content
 */
export function parseTemplateCSV(content: string): Partial<Template['clauses'][0]>[] {
  const lines = content.split(/\r?\n/).filter(line => line.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const clauses: Partial<Template['clauses'][0]>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const clause: Partial<Template['clauses'][0]> = {};

    headers.forEach((header, index) => {
      const value = values[index]?.trim() || '';
      switch (header) {
        case 'clause number':
          clause.clauseNumber = value;
          break;
        case 'issue/topic':
        case 'issue':
          clause.issue = value;
          break;
        case 'clause text':
        case 'original text':
          clause.clauseText = value;
          break;
        case 'proposed change':
          clause.proposedChange = value;
          break;
        case 'counter-proposal':
        case 'counterproposal':
          clause.counterProposal = value;
          break;
        case 'counter-proposal wording':
        case 'counterproposal wording':
          clause.counterproposalWording = value;
          break;
        case 'impact category':
          clause.impactCategory = value;
          break;
        case 'impact subcategory':
          clause.impactSubcategory = value;
          break;
      }
    });

    if (clause.clauseNumber || clause.issue || clause.clauseText) {
      clauses.push(clause);
    }
  }

  return clauses;
}
