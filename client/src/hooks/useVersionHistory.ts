// Contract Negotiation Tracker - useVersionHistory Hook
// Clause version snapshots, comparison, and multi-round negotiation tracking
// Uses 3-Text Model: baselineText, theirPosition, ourPosition

import { useCallback } from 'react';
import type { ClauseVersion, ClauseItem, NegotiationParty } from '@/types';

interface SaveVersionOptions {
  round?: number;
  party?: NegotiationParty;
  notes?: string;
}

export function useVersionHistory(
  updateClauseItem: (contractId: number, itemId: number, updates: Partial<ClauseItem>) => void
) {
  // Get the current round number for a clause (from item or versions)
  const getCurrentRound = useCallback((item: ClauseItem): number => {
    if (item.currentRound) return item.currentRound;
    const versions = item.versions || [];
    if (versions.length === 0) return 1;
    const maxRound = Math.max(...versions.map(v => v.round || 0));
    return Math.max(maxRound, 1);
  }, []);

  // Save a version with optional round tracking (3-Text Model)
  const saveVersion = useCallback((
    contractId: number,
    item: ClauseItem,
    label: string,
    options?: SaveVersionOptions
  ) => {
    const existingVersions = item.versions || [];
    const currentRound = options?.round ?? getCurrentRound(item);
    
    const newVersion: ClauseVersion = {
      id: `v-${Date.now()}`,
      clauseItemId: item.id,
      label,
      round: currentRound,
      party: options?.party,
      // 3-Text Model snapshot
      baselineText: item.baselineText,
      theirPosition: item.theirPosition,
      ourPosition: item.ourPosition,
      status: item.status,
      timestamp: new Date().toISOString(),
      notes: options?.notes,
    };

    // Update both versions array and currentRound on the item
    updateClauseItem(contractId, item.id, {
      versions: [...existingVersions, newVersion],
      currentRound: currentRound,
    });

    return newVersion;
  }, [updateClauseItem, getCurrentRound]);

  // Start a new negotiation round
  const startNewRound = useCallback((
    contractId: number,
    item: ClauseItem,
    party: NegotiationParty,
    label?: string
  ) => {
    const currentRound = getCurrentRound(item);
    const newRound = currentRound + 1;
    const roundLabel = label || `Round ${newRound} - ${party === 'them' ? 'Their Proposal' : 'Our Counter'}`;
    
    return saveVersion(contractId, item, roundLabel, {
      round: newRound,
      party,
    });
  }, [getCurrentRound, saveVersion]);

  // Save counterparty's proposal (their turn)
  const saveTheirProposal = useCallback((
    contractId: number,
    item: ClauseItem,
    notes?: string
  ) => {
    return startNewRound(contractId, item, 'them', undefined);
  }, [startNewRound]);

  // Save our counter-proposal (our turn)
  const saveOurCounter = useCallback((
    contractId: number,
    item: ClauseItem,
    notes?: string
  ) => {
    const currentRound = getCurrentRound(item);
    // If we're countering, it's part of the same round
    return saveVersion(contractId, item, `Round ${currentRound} - Our Counter`, {
      round: currentRound,
      party: 'us',
      notes,
    });
  }, [getCurrentRound, saveVersion]);

  const deleteVersion = useCallback((
    contractId: number,
    item: ClauseItem,
    versionId: string
  ) => {
    const existingVersions = item.versions || [];
    updateClauseItem(contractId, item.id, {
      versions: existingVersions.filter(v => v.id !== versionId),
    });
  }, [updateClauseItem]);

  const restoreVersion = useCallback((
    contractId: number,
    item: ClauseItem,
    version: ClauseVersion
  ) => {
    // Save current state as a version before restoring
    const currentRound = getCurrentRound(item);
    const backupVersion: ClauseVersion = {
      id: `v-${Date.now()}`,
      clauseItemId: item.id,
      label: 'Before restore',
      round: currentRound,
      party: 'us',
      // 3-Text Model snapshot
      baselineText: item.baselineText,
      theirPosition: item.theirPosition,
      ourPosition: item.ourPosition,
      status: item.status,
      timestamp: new Date().toISOString(),
    };

    const existingVersions = item.versions || [];
    // Restore from version - note: baselineText rarely changes
    updateClauseItem(contractId, item.id, {
      theirPosition: version.theirPosition,
      ourPosition: version.ourPosition,
      versions: [...existingVersions, backupVersion],
    });
  }, [updateClauseItem, getCurrentRound]);

  const compareVersions = useCallback((v1: ClauseVersion, v2: ClauseVersion) => {
    return {
      baselineChanged: v1.baselineText !== v2.baselineText,
      theirPositionChanged: v1.theirPosition !== v2.theirPosition,
      ourPositionChanged: v1.ourPosition !== v2.ourPosition,
    };
  }, []);

  // Get versions grouped by round
  const getVersionsByRound = useCallback((item: ClauseItem) => {
    const versions = item.versions || [];
    const rounds: Map<number, ClauseVersion[]> = new Map();
    
    versions.forEach(v => {
      const round = v.round || 0;
      if (!rounds.has(round)) {
        rounds.set(round, []);
      }
      rounds.get(round)!.push(v);
    });
    
    // Sort each round's versions by timestamp
    rounds.forEach(roundVersions => {
      roundVersions.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    });
    
    return rounds;
  }, []);

  // Get the latest version from each party for comparison
  const getLatestPositions = useCallback((item: ClauseItem) => {
    const versions = item.versions || [];
    const theirVersions = versions.filter(v => v.party === 'them');
    const ourVersions = versions.filter(v => v.party === 'us');
    
    return {
      theirLatest: theirVersions.length > 0 
        ? theirVersions.reduce((a, b) => new Date(a.timestamp) > new Date(b.timestamp) ? a : b)
        : null,
      ourLatest: ourVersions.length > 0
        ? ourVersions.reduce((a, b) => new Date(a.timestamp) > new Date(b.timestamp) ? a : b)
        : null,
    };
  }, []);

  return {
    saveVersion,
    startNewRound,
    saveTheirProposal,
    saveOurCounter,
    deleteVersion,
    restoreVersion,
    compareVersions,
    getCurrentRound,
    getVersionsByRound,
    getLatestPositions,
  };
}
