// Contract Negotiation Tracker - usePlaybook Hook
// Negotiation guidance knowledge base

import { useState, useCallback, useEffect, useMemo } from 'react';
import type { PlaybookTopic, PlaybookPosition } from '@/types';
import { samplePlaybookTopics } from '@/data/sampleData';

const STORAGE_KEY = 'negotiation-tracker-playbook';

function loadPlaybook(): PlaybookTopic[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load playbook from localStorage:', e);
  }
  return samplePlaybookTopics;
}

function savePlaybook(topics: PlaybookTopic[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(topics));
  } catch (e) {
    console.error('Failed to save playbook to localStorage:', e);
  }
}

export function usePlaybook() {
  const [topics, setTopics] = useState<PlaybookTopic[]>(() => loadPlaybook());

  useEffect(() => {
    savePlaybook(topics);
  }, [topics]);

  const categories = useMemo(() => {
    const cats = new Set(topics.map(t => t.category));
    return Array.from(cats).sort();
  }, [topics]);

  const getTopicsByCategory = useCallback((category: string) => {
    return topics.filter(t => t.category === category);
  }, [topics]);

  const getTopicsForClauseType = useCallback((clauseType: string) => {
    const normalizedType = clauseType.toLowerCase();
    return topics.filter(t => 
      t.relatedClauseTypes.some(ct => 
        ct.toLowerCase().includes(normalizedType) || 
        normalizedType.includes(ct.toLowerCase())
      )
    );
  }, [topics]);

  const searchTopics = useCallback((query: string) => {
    const normalizedQuery = query.toLowerCase();
    return topics.filter(t =>
      t.title.toLowerCase().includes(normalizedQuery) ||
      t.description.toLowerCase().includes(normalizedQuery) ||
      t.category.toLowerCase().includes(normalizedQuery) ||
      t.commonObjections.some(o => o.toLowerCase().includes(normalizedQuery))
    );
  }, [topics]);

  const createTopic = useCallback((data: Omit<PlaybookTopic, 'id'>) => {
    const newTopic: PlaybookTopic = {
      ...data,
      id: `pb-${Date.now()}`,
    };
    setTopics(prev => [...prev, newTopic]);
    return newTopic;
  }, []);

  const updateTopic = useCallback((id: string, updates: Partial<PlaybookTopic>) => {
    setTopics(prev => prev.map(t =>
      t.id === id ? { ...t, ...updates } : t
    ));
  }, []);

  const deleteTopic = useCallback((id: string) => {
    setTopics(prev => prev.filter(t => t.id !== id));
  }, []);

  const addPosition = useCallback((topicId: string, position: Omit<PlaybookPosition, 'id'>) => {
    setTopics(prev => prev.map(t => {
      if (t.id !== topicId) return t;
      const newPosition: PlaybookPosition = {
        ...position,
        id: `pos-${Date.now()}`,
      };
      return {
        ...t,
        positions: [...t.positions, newPosition],
      };
    }));
  }, []);

  const updatePosition = useCallback((topicId: string, positionId: string, updates: Partial<PlaybookPosition>) => {
    setTopics(prev => prev.map(t => {
      if (t.id !== topicId) return t;
      return {
        ...t,
        positions: t.positions.map(p =>
          p.id === positionId ? { ...p, ...updates } : p
        ),
      };
    }));
  }, []);

  const deletePosition = useCallback((topicId: string, positionId: string) => {
    setTopics(prev => prev.map(t => {
      if (t.id !== topicId) return t;
      return {
        ...t,
        positions: t.positions.filter(p => p.id !== positionId),
      };
    }));
  }, []);

  return {
    topics,
    categories,
    getTopicsByCategory,
    getTopicsForClauseType,
    searchTopics,
    createTopic,
    updateTopic,
    deleteTopic,
    addPosition,
    updatePosition,
    deletePosition,
  };
}
