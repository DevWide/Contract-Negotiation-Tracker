// Help Widget - Floating help button with feature discovery checklist
import { useState } from 'react';
import { useOnboarding, DISCOVERABLE_FEATURES } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { 
  HelpCircle, 
  CheckCircle2, 
  Circle,
  RotateCcw,
  Sparkles,
  FileText,
  GitCompare,
  Filter,
  Clock,
  BookOpen,
  Library,
  Download,
  Plus,
  EyeOff
} from 'lucide-react';
import { cn } from '@/lib/utils';

const FEATURE_DETAILS: Record<string, { 
  icon: typeof FileText; 
  label: string; 
  description: string;
  tourTarget?: string; // Selector to scroll to
  hint: string; // Action hint for user
}> = {
  'create-contract': {
    icon: Plus,
    label: 'Create a contract',
    description: 'Start a new contract negotiation',
    tourTarget: '[data-tour="contract-switcher"]',
    hint: 'Click the contract dropdown → "New Contract"',
  },
  'add-clause': {
    icon: FileText,
    label: 'Add a clause',
    description: 'Add clause with baseline and positions',
    tourTarget: '[data-tour="add-clause"]',
    hint: 'Click the "Add Clause" button',
  },
  'compare-texts': {
    icon: GitCompare,
    label: 'Compare texts',
    description: 'View diff between versions',
    tourTarget: '[data-tour="clause-actions"]',
    hint: 'Click ⋯ in Actions → "Compare Text"',
  },
  'filter-by-status': {
    icon: Filter,
    label: 'Filter by status',
    description: 'Click dashboard cards to filter',
    tourTarget: '[data-tour="dashboard-stats"]',
    hint: 'Click any status card in the dashboard',
  },
  'add-timeline-note': {
    icon: Clock,
    label: 'Add timeline note',
    description: 'Document negotiation milestones',
    tourTarget: '[data-tour="add-timeline"]',
    hint: 'Expand Timeline → Click "Add Event"',
  },
  'view-playbook': {
    icon: BookOpen,
    label: 'View playbook',
    description: 'Access negotiation guidance',
    tourTarget: '[data-tour="clause-actions"]',
    hint: 'Click ⋯ in Actions → "View Playbook"',
  },
  'use-template': {
    icon: Library,
    label: 'Use a template',
    description: 'Create contract from template',
    tourTarget: '[data-tour="contract-switcher"]',
    hint: 'Click contract dropdown → "From Template"',
  },
  'export-data': {
    icon: Download,
    label: 'Export data',
    description: 'Export to CSV or JSON',
    tourTarget: '[data-tour="clause-table"]',
    hint: 'Click "Export" button above the table',
  },
};

export function HelpWidget() {
  const [open, setOpen] = useState(false);
  const { 
    discoveredFeatures, 
    discoveryProgress, 
    startTour,
    resetOnboarding,
    hasCompletedTour,
    hideHelpWidget,
    setHideHelpWidget,
  } = useOnboarding();

  // Don't render if hidden
  if (hideHelpWidget) {
    return null;
  }

  const undiscoveredCount = DISCOVERABLE_FEATURES.length - discoveredFeatures.length;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            size="icon"
            className={cn(
              "w-12 h-12 rounded-full shadow-lg transition-all",
              "bg-[oklch(0.45_0.08_160)] hover:bg-[oklch(0.50_0.08_160)]",
              "hover:scale-110"
            )}
          >
            <HelpCircle className="w-6 h-6" />
            {undiscoveredCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[oklch(0.55_0.12_45)] text-white text-xs font-bold flex items-center justify-center">
                {undiscoveredCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        
        <PopoverContent 
          side="top" 
          align="end" 
          className="w-80 p-0"
          sideOffset={12}
        >
          {/* Header */}
          <div className="p-4 border-b bg-muted/30">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[oklch(0.45_0.08_160)]" />
                Feature Discovery
              </h3>
              <span className="text-sm font-medium text-[oklch(0.45_0.08_160)]">
                {discoveryProgress}%
              </span>
            </div>
            <Progress value={discoveryProgress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {discoveredFeatures.length} of {DISCOVERABLE_FEATURES.length} features discovered
            </p>
          </div>

          {/* Feature List */}
          <div className="max-h-[300px] overflow-y-auto p-2">
            {DISCOVERABLE_FEATURES.map((featureId) => {
              const feature = FEATURE_DETAILS[featureId];
              const isDiscovered = discoveredFeatures.includes(featureId);
              const Icon = feature.icon;

              const handleFeatureClick = () => {
                if (isDiscovered) return;
                
                // Close popover
                setOpen(false);
                
                // Scroll to target element if specified
                if (feature.tourTarget) {
                  setTimeout(() => {
                    const target = document.querySelector(feature.tourTarget!);
                    if (target) {
                      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      // Add temporary highlight
                      target.classList.add('tour-highlight');
                      setTimeout(() => {
                        target.classList.remove('tour-highlight');
                      }, 3000);
                    }
                  }, 100);
                }
              };

              return (
                <div
                  key={featureId}
                  onClick={handleFeatureClick}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-lg transition-colors",
                    isDiscovered 
                      ? "opacity-60" 
                      : "hover:bg-muted/50 cursor-pointer"
                  )}
                  title={isDiscovered ? 'Already discovered!' : feature.hint}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                    isDiscovered 
                      ? "bg-[oklch(0.92_0.04_160)]" 
                      : "bg-muted"
                  )}>
                    <Icon className={cn(
                      "w-4 h-4",
                      isDiscovered 
                        ? "text-[oklch(0.45_0.08_160)]" 
                        : "text-muted-foreground"
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-sm font-medium",
                        isDiscovered && "line-through"
                      )}>
                        {feature.label}
                      </span>
                      {isDiscovered ? (
                        <CheckCircle2 className="w-4 h-4 text-[oklch(0.45_0.08_160)] shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-muted-foreground shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {isDiscovered ? feature.description : feature.hint}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Actions */}
          <div className="p-3 border-t bg-muted/20 space-y-2">
            {!hasCompletedTour && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  setOpen(false);
                  startTour();
                }}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Take the Tour
              </Button>
            )}
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 text-muted-foreground"
                onClick={resetOnboarding}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 text-muted-foreground"
                onClick={() => {
                  setOpen(false);
                  setHideHelpWidget(true);
                }}
              >
                <EyeOff className="w-4 h-4 mr-2" />
                Hide Widget
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
