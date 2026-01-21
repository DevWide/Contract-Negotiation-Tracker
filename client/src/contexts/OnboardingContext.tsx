// Onboarding Context - Manages first-time user onboarding state
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const ONBOARDING_STORAGE_KEY = 'negotiation-tracker-onboarding';

interface OnboardingState {
  hasSeenWelcome: boolean;
  hasCompletedTour: boolean;
  currentTourStep: number;
  isTourActive: boolean;
  dismissedTips: string[];
  discoveredFeatures: string[];
  hideHelpWidget: boolean;
}

interface OnboardingContextType extends OnboardingState {
  // Welcome modal
  showWelcome: () => void;
  dismissWelcome: () => void;
  
  // Tour management
  startTour: () => void;
  nextTourStep: () => void;
  prevTourStep: () => void;
  skipTour: () => void;
  completeTour: () => void;
  
  // Contextual tips
  isTipDismissed: (tipId: string) => boolean;
  dismissTip: (tipId: string) => void;
  
  // Feature discovery
  markFeatureDiscovered: (featureId: string) => void;
  isFeatureDiscovered: (featureId: string) => boolean;
  discoveryProgress: number;
  
  // Help widget visibility
  setHideHelpWidget: (hide: boolean) => void;
  
  // Reset
  resetOnboarding: () => void;
}

const defaultState: OnboardingState = {
  hasSeenWelcome: false,
  hasCompletedTour: false,
  currentTourStep: 0,
  isTourActive: false,
  dismissedTips: [],
  discoveredFeatures: [],
  hideHelpWidget: false,
};

const OnboardingContext = createContext<OnboardingContextType | null>(null);

// Tour step type
export type TourPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TourStep {
  id: string;
  target: string;
  title: string;
  content: string;
  placement: TourPlacement;
}

// Tour steps definition
export const TOUR_STEPS: TourStep[] = [
  {
    id: 'contract-switcher',
    target: '[data-tour="contract-switcher"]',
    title: 'Contract Switcher',
    content: 'Switch between contracts or create new ones from the dropdown menu.',
    placement: 'bottom',
  },
  {
    id: 'dashboard-stats',
    target: '[data-tour="dashboard-stats"]',
    title: 'Dashboard Stats',
    content: 'Click any status card to filter clauses. Press Esc to clear the filter.',
    placement: 'bottom',
  },
  {
    id: 'clause-table',
    target: '[data-tour="clause-table"]',
    title: 'Clause Table',
    content: 'View and manage all contract clauses. Click rows for quick actions.',
    placement: 'top',
  },
  {
    id: 'add-clause',
    target: '[data-tour="add-clause"]',
    title: 'Add Clauses',
    content: 'Create new clauses with baseline text, their position, and your position.',
    placement: 'left',
  },
  {
    id: 'settings',
    target: '[data-tour="settings"]',
    title: 'Settings & Templates',
    content: 'Customize columns, manage templates, and configure impact categories.',
    placement: 'bottom',
  },
];

// Discoverable features for progress tracking
export const DISCOVERABLE_FEATURES = [
  'create-contract',
  'add-clause',
  'compare-texts',
  'filter-by-status',
  'add-timeline-note',
  'view-playbook',
  'use-template',
  'export-data',
];

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OnboardingState>(() => {
    if (typeof window === 'undefined') return defaultState;
    
    try {
      const stored = localStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (stored) {
        return { ...defaultState, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.error('Failed to load onboarding state:', e);
    }
    return defaultState;
  });

  // Persist state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save onboarding state:', e);
    }
  }, [state]);

  // Welcome modal handlers
  const showWelcome = () => {
    setState(prev => ({ ...prev, hasSeenWelcome: false }));
  };

  const dismissWelcome = () => {
    setState(prev => ({ ...prev, hasSeenWelcome: true }));
  };

  // Tour handlers
  const startTour = () => {
    setState(prev => ({ 
      ...prev, 
      isTourActive: true, 
      currentTourStep: 0,
      hasSeenWelcome: true,
    }));
  };

  const nextTourStep = () => {
    setState(prev => {
      const nextStep = prev.currentTourStep + 1;
      if (nextStep >= TOUR_STEPS.length) {
        return { 
          ...prev, 
          isTourActive: false, 
          hasCompletedTour: true,
          currentTourStep: 0,
        };
      }
      return { ...prev, currentTourStep: nextStep };
    });
  };

  const prevTourStep = () => {
    setState(prev => ({
      ...prev,
      currentTourStep: Math.max(0, prev.currentTourStep - 1),
    }));
  };

  const skipTour = () => {
    setState(prev => ({ 
      ...prev, 
      isTourActive: false,
      hasSeenWelcome: true,
    }));
  };

  const completeTour = () => {
    setState(prev => ({ 
      ...prev, 
      isTourActive: false, 
      hasCompletedTour: true,
      currentTourStep: 0,
    }));
  };

  // Contextual tips handlers
  const isTipDismissed = (tipId: string) => {
    return state.dismissedTips.includes(tipId);
  };

  const dismissTip = (tipId: string) => {
    setState(prev => ({
      ...prev,
      dismissedTips: prev.dismissedTips.includes(tipId) 
        ? prev.dismissedTips 
        : [...prev.dismissedTips, tipId],
    }));
  };

  // Feature discovery handlers
  const markFeatureDiscovered = (featureId: string) => {
    setState(prev => ({
      ...prev,
      discoveredFeatures: prev.discoveredFeatures.includes(featureId)
        ? prev.discoveredFeatures
        : [...prev.discoveredFeatures, featureId],
    }));
  };

  const isFeatureDiscovered = (featureId: string) => {
    return state.discoveredFeatures.includes(featureId);
  };

  const discoveryProgress = Math.round(
    (state.discoveredFeatures.length / DISCOVERABLE_FEATURES.length) * 100
  );

  // Reset handler
  const resetOnboarding = () => {
    setState(defaultState);
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
  };

  // Help widget visibility handler
  const setHideHelpWidget = (hide: boolean) => {
    setState(prev => ({ ...prev, hideHelpWidget: hide }));
  };

  const contextValue: OnboardingContextType = {
    ...state,
    showWelcome,
    dismissWelcome,
    startTour,
    nextTourStep,
    prevTourStep,
    skipTour,
    completeTour,
    isTipDismissed,
    dismissTip,
    markFeatureDiscovered,
    isFeatureDiscovered,
    discoveryProgress,
    setHideHelpWidget,
    resetOnboarding,
  };

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
