// Contract Negotiation Tracker - useColumnConfig Hook
// Table column visibility, ordering, sizing

import { useState, useCallback, useEffect } from 'react';
import type { ColumnConfig } from '@/types';
import { defaultColumnConfig } from '@/data/sampleData';

const STORAGE_KEY = 'negotiation-tracker-columns';
const CONFIG_VERSION_KEY = 'negotiation-tracker-columns-version';
const CURRENT_VERSION = 5; // v5: Adjusted column widths for better spacing

function loadColumnConfig(): ColumnConfig[] {
  try {
    const storedVersion = localStorage.getItem(CONFIG_VERSION_KEY);
    const stored = localStorage.getItem(STORAGE_KEY);
    
    // If version mismatch or no version, reset to defaults
    if (!storedVersion || parseInt(storedVersion) !== CURRENT_VERSION) {
      localStorage.setItem(CONFIG_VERSION_KEY, CURRENT_VERSION.toString());
      localStorage.removeItem(STORAGE_KEY);
      return defaultColumnConfig;
    }
    
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load column config from localStorage:', e);
  }
  return defaultColumnConfig;
}

function saveColumnConfig(config: ColumnConfig[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save column config to localStorage:', e);
  }
}

export function useColumnConfig() {
  const [columns, setColumns] = useState<ColumnConfig[]>(() => loadColumnConfig());

  useEffect(() => {
    saveColumnConfig(columns);
  }, [columns]);

  const visibleColumns = columns
    .filter(c => c.visible)
    .sort((a, b) => a.order - b.order);

  const toggleColumn = useCallback((id: string) => {
    setColumns(prev => prev.map(c =>
      c.id === id ? { ...c, visible: !c.visible } : c
    ));
  }, []);

  const setColumnVisible = useCallback((id: string, visible: boolean) => {
    setColumns(prev => prev.map(c =>
      c.id === id ? { ...c, visible } : c
    ));
  }, []);

  const setColumnWidth = useCallback((id: string, width: number) => {
    setColumns(prev => prev.map(c =>
      c.id === id ? { ...c, width } : c
    ));
  }, []);

  const reorderColumns = useCallback((fromIndex: number, toIndex: number) => {
    setColumns(prev => {
      const sorted = [...prev].sort((a, b) => a.order - b.order);
      const [moved] = sorted.splice(fromIndex, 1);
      sorted.splice(toIndex, 0, moved);
      return sorted.map((c, index) => ({ ...c, order: index }));
    });
  }, []);

  const resetColumns = useCallback(() => {
    setColumns(defaultColumnConfig);
  }, []);

  const addCustomColumn = useCallback((label: string) => {
    const id = `custom-${Date.now()}`;
    const maxOrder = Math.max(...columns.map(c => c.order));
    const newColumn: ColumnConfig = {
      id,
      label,
      visible: true,
      width: 150,
      order: maxOrder + 1,
    };
    setColumns(prev => [...prev, newColumn]);
    return newColumn;
  }, [columns]);

  const removeCustomColumn = useCallback((id: string) => {
    if (!id.startsWith('custom-')) return;
    setColumns(prev => prev.filter(c => c.id !== id));
  }, []);

  return {
    columns,
    visibleColumns,
    toggleColumn,
    setColumnVisible,
    setColumnWidth,
    reorderColumns,
    resetColumns,
    addCustomColumn,
    removeCustomColumn,
  };
}
