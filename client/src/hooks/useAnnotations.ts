// Contract Negotiation Tracker - useAnnotations Hook
// Notes/comments on diff changes

import { useCallback } from 'react';
import type { Annotation, ClauseItem } from '@/types';

export function useAnnotations(
  updateClauseItem: (contractId: number, itemId: number, updates: Partial<ClauseItem>) => void
) {
  const addAnnotation = useCallback((
    contractId: number,
    item: ClauseItem,
    annotation: Omit<Annotation, 'id' | 'clauseItemId' | 'timestamp'>
  ) => {
    const newAnnotation: Annotation = {
      ...annotation,
      id: `ann-${Date.now()}`,
      clauseItemId: item.id,
      timestamp: new Date().toISOString(),
    };

    const existingAnnotations = item.annotations || [];
    updateClauseItem(contractId, item.id, {
      annotations: [...existingAnnotations, newAnnotation],
    });

    return newAnnotation;
  }, [updateClauseItem]);

  const updateAnnotation = useCallback((
    contractId: number,
    item: ClauseItem,
    annotationId: string,
    updates: Partial<Annotation>
  ) => {
    const existingAnnotations = item.annotations || [];
    updateClauseItem(contractId, item.id, {
      annotations: existingAnnotations.map(a =>
        a.id === annotationId ? { ...a, ...updates } : a
      ),
    });
  }, [updateClauseItem]);

  const deleteAnnotation = useCallback((
    contractId: number,
    item: ClauseItem,
    annotationId: string
  ) => {
    const existingAnnotations = item.annotations || [];
    updateClauseItem(contractId, item.id, {
      annotations: existingAnnotations.filter(a => a.id !== annotationId),
    });
  }, [updateClauseItem]);

  const getAnnotationsByType = useCallback((
    item: ClauseItem,
    type: Annotation['type']
  ) => {
    return (item.annotations || []).filter(a => a.type === type);
  }, []);

  return {
    addAnnotation,
    updateAnnotation,
    deleteAnnotation,
    getAnnotationsByType,
  };
}
