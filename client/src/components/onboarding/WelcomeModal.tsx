// Welcome Modal - First-time user welcome with tour option
import { useOnboarding } from '@/contexts/OnboardingContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Scale, 
  FileText, 
  GitCompare, 
  BookOpen, 
  Sparkles,
  ArrowRight,
  X
} from 'lucide-react';

export function WelcomeModal() {
  const { hasSeenWelcome, dismissWelcome, startTour } = useOnboarding();

  const features = [
    { icon: FileText, text: 'Track multiple contracts' },
    { icon: GitCompare, text: 'Visual text comparison' },
    { icon: BookOpen, text: 'Negotiation playbook' },
    { icon: Sparkles, text: 'Smart filtering & search' },
  ];

  const handleTakeTour = () => {
    dismissWelcome();
    // Small delay to allow modal to close before tour starts
    setTimeout(() => startTour(), 300);
  };

  const handleSkip = () => {
    dismissWelcome();
  };

  return (
    <Dialog open={!hasSeenWelcome} onOpenChange={(open) => !open && dismissWelcome()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-[oklch(0.45_0.08_160)] flex items-center justify-center mb-4">
            <Scale className="w-8 h-8 text-white" />
          </div>
          <DialogTitle className="font-serif text-2xl">
            Welcome to Contract Negotiation Tracker
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            Streamline your contract negotiations with structured tracking and visual comparisons.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          <div className="grid grid-cols-2 gap-3">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
              >
                <div className="w-8 h-8 rounded-lg bg-[oklch(0.94_0.03_160)] flex items-center justify-center shrink-0">
                  <feature.icon className="w-4 h-4 text-[oklch(0.45_0.08_160)]" />
                </div>
                <span className="text-sm font-medium">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-muted/30 rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground">
            💡 Sample contracts are pre-loaded so you can explore the features right away.
          </p>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 pt-4">
          <Button 
            variant="outline" 
            onClick={handleSkip}
            className="flex-1"
          >
            <X className="w-4 h-4 mr-2" />
            Explore on My Own
          </Button>
          <Button 
            onClick={handleTakeTour}
            className="flex-1 bg-[oklch(0.45_0.08_160)] hover:bg-[oklch(0.50_0.08_160)]"
          >
            Take a Quick Tour
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
