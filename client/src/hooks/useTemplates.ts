// Contract Negotiation Tracker - useTemplates Hook
// Template CRUD and duplication

import { useState, useCallback, useEffect } from 'react';
import type { Template, TemplateClause } from '@/types';
import { sampleTemplates } from '@/data/sampleData';

const STORAGE_KEY = 'negotiation-tracker-templates';

function loadTemplates(): Template[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load templates from localStorage:', e);
  }
  return sampleTemplates;
}

function saveTemplates(templates: Template[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  } catch (e) {
    console.error('Failed to save templates to localStorage:', e);
  }
}

export function useTemplates() {
  const [templates, setTemplates] = useState<Template[]>(() => loadTemplates());

  useEffect(() => {
    saveTemplates(templates);
  }, [templates]);

  const createTemplate = useCallback((data: {
    name: string;
    description: string;
    clauses?: TemplateClause[];
  }) => {
    const newTemplate: Template = {
      id: `tmpl-${Date.now()}`,
      name: data.name,
      description: data.description,
      clauses: data.clauses || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTemplates(prev => [...prev, newTemplate]);
    return newTemplate;
  }, []);

  const updateTemplate = useCallback((id: string, updates: Partial<Template>) => {
    setTemplates(prev => prev.map(t => 
      t.id === id 
        ? { ...t, ...updates, updatedAt: new Date().toISOString() }
        : t
    ));
  }, []);

  const deleteTemplate = useCallback((id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  }, []);

  const duplicateTemplate = useCallback((id: string) => {
    const original = templates.find(t => t.id === id);
    if (!original) return null;

    const newTemplate: Template = {
      ...original,
      id: `tmpl-${Date.now()}`,
      name: `${original.name} (Copy)`,
      clauses: original.clauses.map((clause, index) => ({
        ...clause,
        id: `tc-${Date.now()}-${index}`,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTemplates(prev => [...prev, newTemplate]);
    return newTemplate;
  }, [templates]);

  const addClauseToTemplate = useCallback((templateId: string, clause: Omit<TemplateClause, 'id'>) => {
    setTemplates(prev => prev.map(t => {
      if (t.id !== templateId) return t;
      const newClause: TemplateClause = {
        ...clause,
        id: `tc-${Date.now()}`,
      };
      return {
        ...t,
        clauses: [...t.clauses, newClause],
        updatedAt: new Date().toISOString(),
      };
    }));
  }, []);

  const updateTemplateClause = useCallback((templateId: string, clauseId: string, updates: Partial<TemplateClause>) => {
    setTemplates(prev => prev.map(t => {
      if (t.id !== templateId) return t;
      return {
        ...t,
        clauses: t.clauses.map(c => 
          c.id === clauseId ? { ...c, ...updates } : c
        ),
        updatedAt: new Date().toISOString(),
      };
    }));
  }, []);

  const deleteTemplateClause = useCallback((templateId: string, clauseId: string) => {
    setTemplates(prev => prev.map(t => {
      if (t.id !== templateId) return t;
      return {
        ...t,
        clauses: t.clauses.filter(c => c.id !== clauseId),
        updatedAt: new Date().toISOString(),
      };
    }));
  }, []);

  return {
    templates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    addClauseToTemplate,
    updateTemplateClause,
    deleteTemplateClause,
  };
}
