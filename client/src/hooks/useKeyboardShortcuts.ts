// Contract Negotiation Tracker - useKeyboardShortcuts Hook
// Navigation and actions via keyboard

import { useEffect, useCallback } from 'react';

interface ShortcutHandlers {
  onEscape?: () => void;
  onSave?: () => void;
  onNew?: () => void;
  onSearch?: () => void;
  onDelete?: () => void;
  onExport?: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers, enabled: boolean = true) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Don't trigger shortcuts when typing in inputs
    const target = event.target as HTMLElement;
    const isInput = target.tagName === 'INPUT' || 
                    target.tagName === 'TEXTAREA' || 
                    target.isContentEditable;

    // Escape always works
    if (event.key === 'Escape' && handlers.onEscape) {
      event.preventDefault();
      handlers.onEscape();
      return;
    }

    // Other shortcuts only work outside inputs
    if (isInput) return;

    // Ctrl/Cmd + S = Save
    if ((event.ctrlKey || event.metaKey) && event.key === 's' && handlers.onSave) {
      event.preventDefault();
      handlers.onSave();
      return;
    }

    // Ctrl/Cmd + N = New
    if ((event.ctrlKey || event.metaKey) && event.key === 'n' && handlers.onNew) {
      event.preventDefault();
      handlers.onNew();
      return;
    }

    // Ctrl/Cmd + F or / = Search
    if (((event.ctrlKey || event.metaKey) && event.key === 'f') || event.key === '/' && handlers.onSearch) {
      event.preventDefault();
      handlers.onSearch?.();
      return;
    }

    // Delete or Backspace = Delete (when not in input)
    if ((event.key === 'Delete' || event.key === 'Backspace') && handlers.onDelete) {
      event.preventDefault();
      handlers.onDelete();
      return;
    }

    // Ctrl/Cmd + E = Export
    if ((event.ctrlKey || event.metaKey) && event.key === 'e' && handlers.onExport) {
      event.preventDefault();
      handlers.onExport();
      return;
    }
  }, [enabled, handlers]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

export function useEscapeKey(onEscape: () => void, enabled: boolean = true) {
  useKeyboardShortcuts({ onEscape }, enabled);
}
