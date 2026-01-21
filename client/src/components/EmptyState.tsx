// Contract Negotiation Tracker - EmptyState Component
// Design: Refined Legal Elegance - Welcome screen when no contract is selected

import { useState } from 'react';
import { useNegotiation } from '@/contexts/NegotiationContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { NewContractFromTemplateDialog } from '@/components/NewContractFromTemplateDialog';
import { 
  FileText, 
  Plus, 
  Scale,
  CheckCircle,
  GitCompare,
  BookOpen,
  Clock,
  Library
} from 'lucide-react';

interface EmptyStateProps {
  onCreateContract: () => void;
}

export function EmptyState({ onCreateContract }: EmptyStateProps) {
  const { contracts, templates } = useNegotiation();
  const [showFromTemplateDialog, setShowFromTemplateDialog] = useState(false);

  const features = [
    {
      icon: FileText,
      title: 'Track Multiple Contracts',
      description: 'Manage negotiations across different counterparties and agreements',
    },
    {
      icon: GitCompare,
      title: 'Visual Text Comparison',
      description: 'Side-by-side diff view to see changes between original and proposed text',
    },
    {
      icon: BookOpen,
      title: 'Negotiation Playbook',
      description: 'Built-in guidance with positions, fallbacks, and redlines',
    },
    {
      icon: Clock,
      title: 'Timeline Tracking',
      description: 'Visualize the negotiation journey with key milestones',
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-8">
      <div className="max-w-3xl w-full text-center">
        {/* Hero */}
        <div className="mb-12">
          <div className="w-20 h-20 rounded-2xl bg-[oklch(0.55_0.12_45)] flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Scale className="w-10 h-10 text-[oklch(0.15_0.03_250)]" />
          </div>
          <h1 className="font-serif text-4xl font-semibold text-[oklch(0.28_0.06_160)] mb-4">
            Contract Negotiation Tracker
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Streamline your contract negotiations with structured tracking, 
            visual comparisons, and built-in negotiation guidance.
          </p>
        </div>

        {/* CTA */}
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg"
              onClick={onCreateContract}
              className="bg-[oklch(0.45_0.08_160)] hover:bg-[oklch(0.50_0.08_160)] text-white px-8 py-6 text-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create New Contract
            </Button>
            {templates.length > 0 && (
              <Button 
                size="lg"
                variant="outline"
                onClick={() => setShowFromTemplateDialog(true)}
                className="px-8 py-6 text-lg border-[oklch(0.55_0.12_45)] text-[oklch(0.50_0.10_45)] hover:bg-[oklch(0.93_0.05_45)]"
              >
                <Library className="w-5 h-5 mr-2" />
                From Template
              </Button>
            )}
          </div>
          {contracts.length > 0 && (
            <p className="text-sm text-muted-foreground mt-3">
              or select an existing contract from the dropdown above
            </p>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <Card key={index} className="border shadow-sm text-left">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[oklch(0.94_0.02_250)] flex items-center justify-center shrink-0">
                    <feature.icon className="w-5 h-5 text-[oklch(0.45_0.08_160)]" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sample Data Notice */}
        <p className="text-sm text-muted-foreground mt-8">
          Sample contracts are pre-loaded for demonstration. 
          You can reset to sample data anytime from Settings.
        </p>
      </div>

      {/* New Contract from Template Dialog */}
      <NewContractFromTemplateDialog
        open={showFromTemplateDialog}
        onClose={() => setShowFromTemplateDialog(false)}
      />
    </div>
  );
}
