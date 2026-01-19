// Contract Negotiation Tracker - Text Diff Utility
// LCS (Longest Common Subsequence) algorithm for word-level comparison

import type { DiffWord } from '@/types';

/**
 * Tokenize text into words while preserving punctuation
 */
function tokenize(text: string): string[] {
  if (!text) return [];
  // Split on whitespace but keep punctuation attached to words
  return text.split(/\s+/).filter(word => word.length > 0);
}

/**
 * Compute LCS table for dynamic programming approach
 */
function computeLCSTable(a: string[], b: string[]): number[][] {
  const m = a.length;
  const n = b.length;
  const table: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1].toLowerCase() === b[j - 1].toLowerCase()) {
        table[i][j] = table[i - 1][j - 1] + 1;
      } else {
        table[i][j] = Math.max(table[i - 1][j], table[i][j - 1]);
      }
    }
  }

  return table;
}

/**
 * Backtrack through LCS table to find the diff
 */
function backtrack(
  table: number[][],
  a: string[],
  b: string[],
  i: number,
  j: number
): DiffWord[] {
  if (i === 0 && j === 0) {
    return [];
  }

  if (i === 0) {
    // All remaining words in b are additions
    const result: DiffWord[] = [];
    for (let k = 0; k < j; k++) {
      result.push({ text: b[k], type: 'added' });
    }
    return result;
  }

  if (j === 0) {
    // All remaining words in a are removals
    const result: DiffWord[] = [];
    for (let k = 0; k < i; k++) {
      result.push({ text: a[k], type: 'removed' });
    }
    return result;
  }

  if (a[i - 1].toLowerCase() === b[j - 1].toLowerCase()) {
    const result = backtrack(table, a, b, i - 1, j - 1);
    result.push({ text: b[j - 1], type: 'unchanged' });
    return result;
  }

  if (table[i - 1][j] > table[i][j - 1]) {
    const result = backtrack(table, a, b, i - 1, j);
    result.push({ text: a[i - 1], type: 'removed' });
    return result;
  } else {
    const result = backtrack(table, a, b, i, j - 1);
    result.push({ text: b[j - 1], type: 'added' });
    return result;
  }
}

/**
 * Compute word-level diff between two texts
 */
export function computeDiff(original: string, modified: string): DiffWord[] {
  const originalWords = tokenize(original);
  const modifiedWords = tokenize(modified);

  if (originalWords.length === 0 && modifiedWords.length === 0) {
    return [];
  }

  if (originalWords.length === 0) {
    return modifiedWords.map(word => ({ text: word, type: 'added' }));
  }

  if (modifiedWords.length === 0) {
    return originalWords.map(word => ({ text: word, type: 'removed' }));
  }

  const table = computeLCSTable(originalWords, modifiedWords);
  return backtrack(table, originalWords, modifiedWords, originalWords.length, modifiedWords.length);
}

/**
 * Group consecutive diff words of the same type for cleaner display
 */
export function groupDiffWords(diff: DiffWord[]): DiffWord[][] {
  if (diff.length === 0) return [];

  const groups: DiffWord[][] = [];
  let currentGroup: DiffWord[] = [diff[0]];

  for (let i = 1; i < diff.length; i++) {
    if (diff[i].type === currentGroup[0].type) {
      currentGroup.push(diff[i]);
    } else {
      groups.push(currentGroup);
      currentGroup = [diff[i]];
    }
  }
  groups.push(currentGroup);

  return groups;
}

/**
 * Calculate diff statistics
 */
export function getDiffStats(diff: DiffWord[]): { added: number; removed: number; unchanged: number } {
  return diff.reduce(
    (acc, word) => {
      acc[word.type]++;
      return acc;
    },
    { added: 0, removed: 0, unchanged: 0 }
  );
}

/**
 * Check if two texts are identical (ignoring case and whitespace)
 */
export function areTextsIdentical(a: string, b: string): boolean {
  const normalizeA = a.toLowerCase().replace(/\s+/g, ' ').trim();
  const normalizeB = b.toLowerCase().replace(/\s+/g, ' ').trim();
  return normalizeA === normalizeB;
}
