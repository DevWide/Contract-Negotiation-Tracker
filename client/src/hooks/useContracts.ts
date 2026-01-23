// Contract Negotiation Tracker - useContracts Hook
// Multi-contract CRUD, switching, item management, timeline

import { useState, useCallback, useEffect } from 'react';
import type { Contract, ClauseItem, TimelineEvent, PaperSource, BallInCourt, ContractStatus, Template } from '@/types';
import { sampleContracts } from '@/data/sampleData';

const STORAGE_KEY = 'negotiation-tracker-contracts';
const VERSION_KEY = 'negotiation-tracker-contracts-version';
const CURRENT_VERSION = 5; // Increment when sample data changes - v5 added Round 2 versions

function loadContracts(): Contract[] {
  try {
    // Check version - if outdated, reset to sample data
    const storedVersion = localStorage.getItem(VERSION_KEY);
    if (storedVersion && parseInt(storedVersion) < CURRENT_VERSION) {
      console.log('Contract data version outdated, resetting to sample data');
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(VERSION_KEY, CURRENT_VERSION.toString());
      return sampleContracts;
    }
    
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      // Set version if not present
      if (!storedVersion) {
        localStorage.setItem(VERSION_KEY, CURRENT_VERSION.toString());
      }
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load contracts from localStorage:', e);
  }
  localStorage.setItem(VERSION_KEY, CURRENT_VERSION.toString());
  return sampleContracts;
}

function saveContracts(contracts: Contract[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contracts));
  } catch (e) {
    console.error('Failed to save contracts to localStorage:', e);
  }
}

export function useContracts() {
  const [contracts, setContracts] = useState<Contract[]>(() => loadContracts());
  const [activeContractId, setActiveContractId] = useState<number | null>(() => {
    const loaded = loadContracts();
    return loaded.length > 0 ? loaded[0].id : null;
  });

  // Persist to localStorage whenever contracts change
  useEffect(() => {
    saveContracts(contracts);
  }, [contracts]);

  const activeContract = contracts.find(c => c.id === activeContractId) || null;

  // Contract CRUD
  const createContract = useCallback((data: {
    name: string;
    counterparty: string;
    description: string;
    paperSource: PaperSource;
  }) => {
    const newContract: Contract = {
      id: Date.now(),
      name: data.name,
      counterparty: data.counterparty,
      description: data.description,
      status: 'active',
      paperSource: data.paperSource,
      ballInCourt: data.paperSource === 'counterparty' ? 'us' : 'them',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: [],
      timeline: [{
        id: 1,
        type: 'Created',
        description: 'Contract negotiation initiated',
        date: new Date().toISOString().slice(0, 10),
        timestamp: new Date().toISOString(),
      }],
    };
    setContracts(prev => [...prev, newContract]);
    setActiveContractId(newContract.id);
    return newContract;
  }, []);

  // Create contract from template
  const createContractFromTemplate = useCallback((data: {
    name: string;
    counterparty: string;
    description: string;
    template: Template;
  }) => {
    const now = new Date();
    const newContract: Contract = {
      id: Date.now(),
      name: data.name,
      counterparty: data.counterparty,
      description: data.description || data.template.description,
      status: 'active',
      paperSource: 'ours', // When using our template, it's always "our paper"
      ballInCourt: 'them', // We sent it out first
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      // Only copy the baseline text from template
      // theirPosition and ourPosition start from baseline
      // because this is a fresh contract - no negotiation has happened yet
      items: data.template.clauses.map((clause, index) => ({
        id: Date.now() + index + 1,
        clauseNumber: clause.clauseNumber,
        topic: clause.topic || clause.issue.split(' ')[0] || 'General',
        // ===== THE 3 TEXTS =====
        baselineText: clause.baselineText, // Template's baseline text
        theirPosition: clause.baselineText, // Start same as baseline
        ourPosition: '', // Empty - we haven't responded yet
        // ===== CONTEXT =====
        issue: clause.issue,
        rationale: clause.rationale || '',
        currentRound: 0, // Fresh contract starts at round 0
        status: 'No Changes' as const,
        priority: 'Medium' as const,
        owner: 'Legal',
        impactCategory: clause.impactCategory || '',
        impactSubcategory: clause.impactSubcategory || '',
        riskLevel: 'medium' as const,
        templateId: data.template.id,
        templateClauseId: clause.id,
        versions: [],
        annotations: [],
      })),
      timeline: [{
        id: 1,
        type: 'Created',
        description: `Contract created from template "${data.template.name}"`,
        date: now.toISOString().slice(0, 10),
        timestamp: now.toISOString(),
      }],
    };
    setContracts(prev => [...prev, newContract]);
    setActiveContractId(newContract.id);
    return newContract;
  }, []);

  const updateContract = useCallback((id: number, updates: Partial<Contract>) => {
    setContracts(prev => prev.map(c => 
      c.id === id 
        ? { ...c, ...updates, updatedAt: new Date().toISOString() }
        : c
    ));
  }, []);

  const deleteContract = useCallback((id: number) => {
    setContracts(prev => {
      const filtered = prev.filter(c => c.id !== id);
      if (activeContractId === id && filtered.length > 0) {
        setActiveContractId(filtered[0].id);
      } else if (filtered.length === 0) {
        setActiveContractId(null);
      }
      return filtered;
    });
  }, [activeContractId]);

  const duplicateContract = useCallback((id: number) => {
    const original = contracts.find(c => c.id === id);
    if (!original) return null;

    const newContract: Contract = {
      ...original,
      id: Date.now(),
      name: `${original.name} (Copy)`,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: original.items.map((item, index) => ({
        ...item,
        id: Date.now() + index,
        versions: [],
        annotations: [],
      })),
      timeline: [{
        id: 1,
        type: 'Created',
        description: `Duplicated from "${original.name}"`,
        date: new Date().toISOString().slice(0, 10),
        timestamp: new Date().toISOString(),
      }],
    };
    setContracts(prev => [...prev, newContract]);
    return newContract;
  }, [contracts]);

  const archiveContract = useCallback((id: number) => {
    updateContract(id, { status: 'archived' });
  }, [updateContract]);

  const completeContract = useCallback((id: number) => {
    updateContract(id, { status: 'completed' });
  }, [updateContract]);

  const toggleBallInCourt = useCallback((id: number) => {
    const contract = contracts.find(c => c.id === id);
    if (!contract) return;
    updateContract(id, { 
      ballInCourt: contract.ballInCourt === 'us' ? 'them' : 'us' 
    });
  }, [contracts, updateContract]);

  // Clause Item CRUD
  const addClauseItem = useCallback((contractId: number, item: Omit<ClauseItem, 'id'>) => {
    setContracts(prev => prev.map(c => {
      if (c.id !== contractId) return c;
      const newItem: ClauseItem = {
        ...item,
        id: Date.now(),
        versions: [],
        annotations: [],
      };
      return {
        ...c,
        items: [...c.items, newItem],
        updatedAt: new Date().toISOString(),
      };
    }));
  }, []);

  const updateClauseItem = useCallback((contractId: number, itemId: number, updates: Partial<ClauseItem>) => {
    setContracts(prev => prev.map(c => {
      if (c.id !== contractId) return c;
      return {
        ...c,
        items: c.items.map(item => 
          item.id === itemId ? { ...item, ...updates } : item
        ),
        updatedAt: new Date().toISOString(),
      };
    }));
  }, []);

  const deleteClauseItem = useCallback((contractId: number, itemId: number) => {
    setContracts(prev => prev.map(c => {
      if (c.id !== contractId) return c;
      return {
        ...c,
        items: c.items.filter(item => item.id !== itemId),
        updatedAt: new Date().toISOString(),
      };
    }));
  }, []);

  // Timeline Management
  const addTimelineEvent = useCallback((contractId: number, event: Omit<TimelineEvent, 'id' | 'timestamp'>) => {
    setContracts(prev => prev.map(c => {
      if (c.id !== contractId) return c;
      const newEvent: TimelineEvent = {
        ...event,
        id: Date.now(),
        timestamp: new Date().toISOString(),
      };
      return {
        ...c,
        timeline: [...c.timeline, newEvent].sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        ),
        updatedAt: new Date().toISOString(),
      };
    }));
  }, []);

  const deleteTimelineEvent = useCallback((contractId: number, eventId: number) => {
    setContracts(prev => prev.map(c => {
      if (c.id !== contractId) return c;
      return {
        ...c,
        timeline: c.timeline.filter(e => e.id !== eventId),
        updatedAt: new Date().toISOString(),
      };
    }));
  }, []);

  const updateTimelineEvent = useCallback((contractId: number, eventId: number, updates: Partial<TimelineEvent>) => {
    setContracts(prev => prev.map(c => {
      if (c.id !== contractId) return c;
      return {
        ...c,
        timeline: c.timeline.map(e => 
          e.id === eventId ? { ...e, ...updates } : e
        ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
        updatedAt: new Date().toISOString(),
      };
    }));
  }, []);

  // Bulk import
  const importClauseItems = useCallback((contractId: number, items: Partial<ClauseItem>[]) => {
    setContracts(prev => prev.map(c => {
      if (c.id !== contractId) return c;
      const newItems: ClauseItem[] = items.map((item, index) => ({
        id: Date.now() + index,
        clauseNumber: item.clauseNumber || '',
        topic: item.topic || '',
        // ===== THE 3 TEXTS =====
        baselineText: item.baselineText || '',
        theirPosition: item.theirPosition || '',
        ourPosition: item.ourPosition || '',
        // ===== CONTEXT =====
        issue: item.issue || '',
        rationale: item.rationale || '',
        currentRound: item.currentRound || 0,
        status: item.status || 'No Changes',
        priority: item.priority || 'Medium',
        owner: item.owner || 'Legal',
        impactCategory: item.impactCategory || '',
        impactSubcategory: item.impactSubcategory || '',
        riskLevel: item.riskLevel || 'medium',
        versions: [],
        annotations: [],
      }));
      return {
        ...c,
        items: [...c.items, ...newItems],
        updatedAt: new Date().toISOString(),
      };
    }));
  }, []);

  // Clear all data
  const clearAllData = useCallback(() => {
    setContracts([]);
    setActiveContractId(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Reset to sample data
  const resetToSampleData = useCallback(() => {
    setContracts(sampleContracts);
    setActiveContractId(sampleContracts[0]?.id || null);
  }, []);

  return {
    contracts,
    activeContract,
    activeContractId,
    setActiveContractId,
    createContract,
    createContractFromTemplate,
    updateContract,
    deleteContract,
    duplicateContract,
    archiveContract,
    completeContract,
    toggleBallInCourt,
    addClauseItem,
    updateClauseItem,
    deleteClauseItem,
    addTimelineEvent,
    updateTimelineEvent,
    deleteTimelineEvent,
    importClauseItems,
    clearAllData,
    resetToSampleData,
  };
}
