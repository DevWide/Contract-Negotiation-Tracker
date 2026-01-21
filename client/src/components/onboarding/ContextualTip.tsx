// Contextual Tip - First-time hint tooltips that appear once per feature
import { ReactNode, useState, useEffect } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Lightbulb, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContextualTipProps {
  tipId: string;
  children: ReactNode;
  content: ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  featureId?: string; // Optional: also marks a feature as discovered
  delayMs?: number;
  className?: string;
}

export function ContextualTip({ 
  tipId, 
  children, 
  content, 
  side = 'top',
  featureId,
  delayMs = 500,
  className,
}: ContextualTipProps) {
  const { 
    isTipDismissed, 
    dismissTip, 
    isTourActive,
    markFeatureDiscovered,
  } = useOnboarding();
  
  const [showTip, setShowTip] = useState(false);
  const [hasBeenShown, setHasBeenShown] = useState(false);

  const isDismissed = isTipDismissed(tipId);

  // Show tip after delay if not dismissed
  useEffect(() => {
    if (isDismissed || isTourActive || hasBeenShown) return;

    const timer = setTimeout(() => {
      setShowTip(true);
      setHasBeenShown(true);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [isDismissed, isTourActive, hasBeenShown, delayMs]);

  const handleDismiss = () => {
    setShowTip(false);
    dismissTip(tipId);
    if (featureId) {
      markFeatureDiscovered(featureId);
    }
  };

  const handleInteraction = () => {
    if (featureId) {
      markFeatureDiscovered(featureId);
    }
  };

  // If tip was dismissed, just render children
  if (isDismissed || isTourActive) {
    return <span onClick={handleInteraction}>{children}</span>;
  }

  return (
    <Tooltip open={showTip} onOpenChange={setShowTip}>
      <TooltipTrigger asChild onClick={handleInteraction}>
        <span className={className}>{children}</span>
      </TooltipTrigger>
      <TooltipContent 
        side={side} 
        className={cn(
          "max-w-[280px] p-0 bg-card border-2 border-[oklch(0.55_0.12_45)]",
          "shadow-lg"
        )}
        sideOffset={8}
      >
        <div className="p-3">
          <div className="flex items-start gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-[oklch(0.55_0.12_45)] shrink-0 mt-0.5" />
            <div className="text-sm flex-1">{content}</div>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 shrink-0 -mt-0.5 -mr-1 text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation();
                handleDismiss();
              }}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground"
              onClick={(e) => {
                e.stopPropagation();
                handleDismiss();
              }}
            >
              Got it!
            </Button>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

// Hook for programmatic feature discovery marking
export function useFeatureDiscovery() {
  const { markFeatureDiscovered, isFeatureDiscovered } = useOnboarding();
  
  return {
    markDiscovered: markFeatureDiscovered,
    isDiscovered: isFeatureDiscovered,
  };
}
