// Contract Negotiation Tracker - ContractStatusBar Component
// Design: Refined Legal Elegance - Shows paper source and ball-in-court status

import { useNegotiation } from '@/contexts/NegotiationContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { 
  ChevronDown, 
  FileText, 
  Users, 
  ArrowLeftRight,
  Building2,
  Calendar,
  Clock
} from 'lucide-react';
import { useState } from 'react';

export function ContractStatusBar() {
  const { activeContract, toggleBallInCourt } = useNegotiation();
  const [isOpen, setIsOpen] = useState(true);

  if (!activeContract) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const paperSourceLabel = activeContract.paperSource === 'ours' ? 'Our Paper' : 'Counterparty Paper';
  const ballLabel = activeContract.ballInCourt === 'us' ? 'Ball with Us' : 'Ball with Them';

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="bg-card border-b">
        <div className="container">
          <CollapsibleTrigger asChild>
            <button className="w-full flex items-center justify-between py-3 hover:bg-accent/50 transition-colors -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[oklch(0.60_0.14_75)]" />
                  <span className="font-serif font-semibold text-lg">{activeContract.name}</span>
                </div>
                {activeContract.counterparty && (
                  <div className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Building2 className="w-4 h-4" />
                    <span>{activeContract.counterparty}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Badge 
                  variant="outline" 
                  className={`${
                    activeContract.paperSource === 'ours' 
                      ? 'border-[oklch(0.60_0.14_75)] text-[oklch(0.50_0.12_75)] bg-[oklch(0.92_0.06_75)]'
                      : 'border-[oklch(0.50_0.10_240)] text-[oklch(0.40_0.08_240)] bg-[oklch(0.92_0.05_240)]'
                  }`}
                >
                  {paperSourceLabel}
                </Badge>
                <Badge 
                  variant="outline"
                  className={`${
                    activeContract.ballInCourt === 'us'
                      ? 'border-[oklch(0.55_0.15_55)] text-[oklch(0.45_0.12_55)] bg-[oklch(0.92_0.06_55)]'
                      : 'border-[oklch(0.45_0.12_145)] text-[oklch(0.35_0.10_145)] bg-[oklch(0.92_0.06_145)]'
                  }`}
                >
                  {ballLabel}
                </Badge>
                <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </div>
            </button>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="pb-4 pt-2 grid grid-cols-1 md:grid-cols-3 gap-4 border-t">
              {/* Contract Details */}
              <div className="space-y-2 pt-4">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Contract Details
                </h4>
                {activeContract.description && (
                  <p className="text-sm text-foreground/80">{activeContract.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Created {formatDate(activeContract.createdAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Updated {formatDate(activeContract.updatedAt)}
                  </span>
                </div>
              </div>

              {/* Paper Source Info */}
              <div className="space-y-2 pt-4 md:border-l md:pl-4">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Paper Source
                </h4>
                <div className="flex items-start gap-2">
                  <FileText className={`w-5 h-5 mt-0.5 ${
                    activeContract.paperSource === 'ours' 
                      ? 'text-[oklch(0.60_0.14_75)]' 
                      : 'text-[oklch(0.50_0.10_240)]'
                  }`} />
                  <div>
                    <p className="text-sm font-medium">{paperSourceLabel}</p>
                    <p className="text-xs text-muted-foreground">
                      {activeContract.paperSource === 'ours'
                        ? 'We provided the original template. Defending our positions.'
                        : 'Counterparty provided the template. Requesting changes.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Ball in Court */}
              <div className="space-y-2 pt-4 md:border-l md:pl-4">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Ball in Court
                </h4>
                <div className="flex items-start gap-2">
                  <Users className={`w-5 h-5 mt-0.5 ${
                    activeContract.ballInCourt === 'us' 
                      ? 'text-[oklch(0.55_0.15_55)]' 
                      : 'text-[oklch(0.45_0.12_145)]'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{ballLabel}</p>
                    <p className="text-xs text-muted-foreground">
                      {activeContract.ballInCourt === 'us'
                        ? 'We need to respond with our position.'
                        : 'Awaiting response from counterparty.'}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleBallInCourt(activeContract.id)}
                    className="shrink-0"
                  >
                    <ArrowLeftRight className="w-4 h-4 mr-1" />
                    Switch
                  </Button>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </div>
    </Collapsible>
  );
}
