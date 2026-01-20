// Contract Negotiation Tracker - ViewModal Component
// Design: Refined Legal Elegance - Expandable view for clause details

import { useEscapeKey } from '@/hooks/useKeyboardShortcuts';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { X, Edit, GitCompare } from 'lucide-react';
import type { ClauseItem } from '@/types';

interface ViewModalProps {
  item: ClauseItem;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  onCompare: () => void;
}

export function ViewModal({ item, open, onClose, onEdit, onCompare }: ViewModalProps) {
  useEscapeKey(onClose, open);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Agreed': return 'status-agreed';
      case 'In Discussion': return 'status-discussion';
      case 'Blocked': return 'status-blocked';
      case 'Escalated': return 'status-escalated';
      case 'No Changes': return 'status-nochanges';
      default: return '';
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'High': return 'priority-high';
      case 'Medium': return 'priority-medium';
      case 'Low': return 'priority-low';
      default: return '';
    }
  };

  const getRiskBadgeClass = (risk: string) => {
    switch (risk) {
      case 'critical': return 'bg-[oklch(0.92_0.08_15)] text-[oklch(0.35_0.14_15)]';
      case 'high': return 'bg-[oklch(0.92_0.06_25)] text-[oklch(0.40_0.12_25)]';
      case 'medium': return 'bg-[oklch(0.92_0.06_55)] text-[oklch(0.45_0.12_55)]';
      case 'low': return 'bg-[oklch(0.92_0.06_145)] text-[oklch(0.35_0.10_145)]';
      default: return '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0 pb-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="font-serif text-xl flex items-center gap-3">
              <span className="font-mono text-base text-muted-foreground">
                {item.clauseNumber}
              </span>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">{item.topic}</span>
                <span>{item.issue}</span>
              </div>
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onCompare}>
                <GitCompare className="w-4 h-4 mr-1" />
                Compare
              </Button>
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0">
          <div className="space-y-6 pr-4 pb-6">
            {/* Status Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={getStatusBadgeClass(item.status)}>
                {item.status}
              </Badge>
              <Badge variant="outline" className={getPriorityBadgeClass(item.priority)}>
                {item.priority} Priority
              </Badge>
              <Badge variant="outline" className={getRiskBadgeClass(item.riskLevel)}>
                {item.riskLevel.charAt(0).toUpperCase() + item.riskLevel.slice(1)} Risk
              </Badge>
              <Badge variant="outline">
                {item.owner}
              </Badge>
              {item.impactCategory && (
                <Badge variant="outline">
                  {item.impactCategory}
                  {item.impactSubcategory && ` / ${item.impactSubcategory}`}
                </Badge>
              )}
            </div>

            <Separator />

            {/* Baseline Text */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Baseline Text
              </h4>
              <div className="p-4 bg-muted/30 rounded-lg font-serif text-sm leading-relaxed">
                {item.baselineText || <span className="text-muted-foreground italic">No baseline text provided</span>}
              </div>
            </div>

            {/* Their Position */}
            {item.theirPosition && item.theirPosition !== item.baselineText && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Their Position
                </h4>
                <div className="p-4 bg-[oklch(0.92_0.06_25)]/30 border border-[oklch(0.80_0.08_25)] rounded-lg font-serif text-sm leading-relaxed">
                  {item.theirPosition}
                </div>
              </div>
            )}

            {/* Our Position */}
            {item.ourPosition && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Our Position
                </h4>
                <div className="p-4 bg-[oklch(0.92_0.06_145)]/30 border border-[oklch(0.80_0.08_145)] rounded-lg font-serif text-sm leading-relaxed">
                  {item.ourPosition}
                </div>
              </div>
            )}

            {/* Rationale */}
            {item.rationale && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Rationale
                </h4>
                <p className="text-sm leading-relaxed">{item.rationale}</p>
              </div>
            )}

            {/* Current Round */}
            {item.currentRound !== undefined && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Current Round
                </h4>
                <Badge variant="outline">Round {item.currentRound}</Badge>
              </div>
            )}

            {/* Version History Summary */}
            {item.versions && item.versions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Version History
                </h4>
                <p className="text-sm text-muted-foreground">
                  {item.versions.length} version{item.versions.length !== 1 ? 's' : ''} saved. 
                  Click "Compare" to view and manage versions.
                </p>
              </div>
            )}

            {/* Annotations Summary */}
            {item.annotations && item.annotations.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Notes & Annotations
                </h4>
                <div className="space-y-2">
                  {item.annotations.slice(0, 3).map(annotation => (
                    <div key={annotation.id} className="p-2 bg-muted/50 rounded text-sm">
                      <Badge variant="outline" className="text-xs mb-1">
                        {annotation.type}
                      </Badge>
                      <p>{annotation.text}</p>
                    </div>
                  ))}
                  {item.annotations.length > 3 && (
                    <p className="text-sm text-muted-foreground">
                      +{item.annotations.length - 3} more. Click "Compare" to view all.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
