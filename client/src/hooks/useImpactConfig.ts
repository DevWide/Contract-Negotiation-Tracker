// Contract Negotiation Tracker - useImpactConfig Hook
// Impact category configuration

import { useState, useCallback, useEffect } from 'react';
import type { ImpactCategory } from '@/types';
import { defaultImpactCategories } from '@/data/sampleData';

const STORAGE_KEY = 'negotiation-tracker-impact-categories';

function loadImpactConfig(): ImpactCategory[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load impact config from localStorage:', e);
  }
  return defaultImpactCategories;
}

function saveImpactConfig(categories: ImpactCategory[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
  } catch (e) {
    console.error('Failed to save impact config to localStorage:', e);
  }
}

export function useImpactConfig() {
  const [categories, setCategories] = useState<ImpactCategory[]>(() => loadImpactConfig());

  useEffect(() => {
    saveImpactConfig(categories);
  }, [categories]);

  const getCategoryNames = useCallback(() => {
    return categories.map(c => c.name);
  }, [categories]);

  const getSubcategories = useCallback((categoryName: string) => {
    const category = categories.find(c => c.name === categoryName);
    return category?.subcategories || [];
  }, [categories]);

  const addCategory = useCallback((name: string, subcategories: string[] = []) => {
    const newCategory: ImpactCategory = {
      id: `cat-${Date.now()}`,
      name,
      subcategories,
    };
    setCategories(prev => [...prev, newCategory]);
    return newCategory;
  }, []);

  const updateCategory = useCallback((id: string, updates: Partial<ImpactCategory>) => {
    setCategories(prev => prev.map(c =>
      c.id === id ? { ...c, ...updates } : c
    ));
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  }, []);

  const addSubcategory = useCallback((categoryId: string, subcategory: string) => {
    setCategories(prev => prev.map(c => {
      if (c.id !== categoryId) return c;
      if (c.subcategories.includes(subcategory)) return c;
      return {
        ...c,
        subcategories: [...c.subcategories, subcategory],
      };
    }));
  }, []);

  const removeSubcategory = useCallback((categoryId: string, subcategory: string) => {
    setCategories(prev => prev.map(c => {
      if (c.id !== categoryId) return c;
      return {
        ...c,
        subcategories: c.subcategories.filter(s => s !== subcategory),
      };
    }));
  }, []);

  const resetCategories = useCallback(() => {
    setCategories(defaultImpactCategories);
  }, []);

  return {
    categories,
    getCategoryNames,
    getSubcategories,
    addCategory,
    updateCategory,
    deleteCategory,
    addSubcategory,
    removeSubcategory,
    resetCategories,
  };
}
