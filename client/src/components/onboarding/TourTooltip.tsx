// Tour Tooltip - Guided tour step tooltip with navigation
import { useEffect, useState, useRef } from 'react';
import { useOnboarding, TOUR_STEPS } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ChevronLeft, 
  ChevronRight, 
  X,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Position {
  top: number;
  left: number;
  placement: 'top' | 'bottom' | 'left' | 'right';
}

export function TourTooltip() {
  const { 
    isTourActive, 
    currentTourStep, 
    nextTourStep, 
    prevTourStep, 
    skipTour,
    completeTour 
  } = useOnboarding();
  
  const [position, setPosition] = useState<Position | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const currentStep = TOUR_STEPS[currentTourStep];
  const isFirstStep = currentTourStep === 0;
  const isLastStep = currentTourStep === TOUR_STEPS.length - 1;

  // Position the tooltip relative to target element
  useEffect(() => {
    if (!isTourActive || !currentStep) {
      setIsVisible(false);
      return;
    }

    const positionTooltip = () => {
      const target = document.querySelector(currentStep.target);
      if (!target || !tooltipRef.current) {
        // If target not found, show centered
        setPosition({
          top: window.innerHeight / 2 - 100,
          left: window.innerWidth / 2 - 175,
          placement: 'bottom',
        });
        setIsVisible(true);
        return;
      }

      const targetRect = target.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const padding = 12;

      let top = 0;
      let left = 0;
      const placement = currentStep.placement;

      switch (placement) {
        case 'bottom':
          top = targetRect.bottom + padding;
          left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
          break;
        case 'top':
          top = targetRect.top - tooltipRect.height - padding;
          left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
          break;
        case 'left':
          top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
          left = targetRect.left - tooltipRect.width - padding;
          break;
        case 'right':
          top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
          left = targetRect.right + padding;
          break;
      }

      // Keep tooltip within viewport
      left = Math.max(padding, Math.min(left, window.innerWidth - tooltipRect.width - padding));
      top = Math.max(padding, Math.min(top, window.innerHeight - tooltipRect.height - padding));

      setPosition({ top, left, placement });
      setIsVisible(true);

      // Scroll target into view if needed
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    // Delay to allow DOM to settle
    const timer = setTimeout(positionTooltip, 100);

    // Reposition on resize
    window.addEventListener('resize', positionTooltip);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', positionTooltip);
    };
  }, [isTourActive, currentTourStep, currentStep]);

  // Highlight target element
  useEffect(() => {
    if (!isTourActive || !currentStep) return;

    const target = document.querySelector(currentStep.target);
    if (target) {
      target.classList.add('tour-highlight');
      return () => target.classList.remove('tour-highlight');
    }
  }, [isTourActive, currentStep]);

  if (!isTourActive || !currentStep) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-[100] transition-opacity duration-300"
        style={{ opacity: isVisible ? 1 : 0 }}
        onClick={skipTour}
      />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className={cn(
          "fixed z-[101] w-[350px] transition-all duration-300",
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        )}
        style={{
          top: position?.top ?? 0,
          left: position?.left ?? 0,
        }}
      >
        <Card className="shadow-xl border-2 border-[oklch(0.45_0.08_160)]">
          <CardContent className="p-4">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[oklch(0.45_0.08_160)] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">{currentStep.title}</h4>
                  <p className="text-xs text-muted-foreground">
                    Step {currentTourStep + 1} of {TOUR_STEPS.length}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                onClick={skipTour}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Content */}
            <p className="text-sm text-muted-foreground mb-4">
              {currentStep.content}
            </p>

            {/* Progress dots */}
            <div className="flex justify-center gap-1.5 mb-4">
              {TOUR_STEPS.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    index === currentTourStep 
                      ? "bg-[oklch(0.45_0.08_160)]" 
                      : index < currentTourStep 
                        ? "bg-[oklch(0.75_0.05_160)]"
                        : "bg-muted"
                  )}
                />
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={prevTourStep}
                disabled={isFirstStep}
                className={isFirstStep ? "invisible" : ""}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={skipTour}
                className="text-muted-foreground"
              >
                Skip Tour
              </Button>

              <Button
                size="sm"
                onClick={isLastStep ? completeTour : nextTourStep}
                className="bg-[oklch(0.45_0.08_160)] hover:bg-[oklch(0.50_0.08_160)]"
              >
                {isLastStep ? "Finish" : "Next"}
                {!isLastStep && <ChevronRight className="w-4 h-4 ml-1" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
