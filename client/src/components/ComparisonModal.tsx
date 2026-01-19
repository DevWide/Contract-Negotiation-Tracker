// Contract Negotiation Tracker - ComparisonModal Component
// Design: Refined Legal Elegance - Full comparison view with diff, versions, annotations, playbook

import { useState, useMemo } from 'react';
import { useNegotiation } from '@/contexts/NegotiationContext';
import { useEscapeKey } from '@/hooks/useKeyboardShortcuts';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  X, 
  Maximize2, 
  Minimize2, 
  History, 
  MessageSquare, 
  BookOpen,
  Plus,
  Save,
  Trash2,
  RotateCcw,
  Users,
  User
} from 'lucide-react';
import { computeDiff, getDiffStats } from '@/lib/textDiff';
import type { ClauseItem, ClauseVersion, Annotation, NegotiationParty } from '@/types';

// Helper to get party display info
function getPartyDisplay(party?: NegotiationParty) {
  switch (party) {
    case 'them':
      return { label: 'Their Proposal', color: 'bg-red-100 text-red-700', icon: Users };
    case 'us':
      return { label: 'Our Counter', color: 'bg-green-100 text-green-700', icon: User };
    case 'original':
      return { label: 'Original', color: 'bg-gray-100 text-gray-700', icon: History };
    default:
      return { label: 'Version', color: 'bg-gray-100 text-gray-600', icon: History };
  }
}

interface ComparisonModalProps {
  item: ClauseItem;
  open: boolean;
  onClose: () => void;
}

export function ComparisonModal({ item, open, onClose }: ComparisonModalProps) {
  const { 
    activeContract,
    saveVersion,
    deleteVersion,
    restoreVersion,
    addAnnotation,
    deleteAnnotation,
    getTopicsForClauseType,
    getCurrentRound,
  } = useNegotiation();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState<'inline' | 'side-by-side'>('inline');
  const [newVersionLabel, setNewVersionLabel] = useState('');
  const [newVersionParty, setNewVersionParty] = useState<NegotiationParty>('us');
  const [newVersionRound, setNewVersionRound] = useState(0);
  const [newAnnotation, setNewAnnotation] = useState({ text: '', type: 'note' as Annotation['type'] });
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);

  // Update round when item changes
  useMemo(() => {
    const currentRound = getCurrentRound(item);
    setNewVersionRound(currentRound);
  }, [item, getCurrentRound]);

  useEscapeKey(onClose, open);

  const diff = useMemo(() => {
    return computeDiff(item.clauseText, item.counterproposalWording);
  }, [item.clauseText, item.counterproposalWording]);

  const diffStats = useMemo(() => getDiffStats(diff), [diff]);

  const relatedPlaybook = useMemo(() => {
    if (!item.impactSubcategory && !item.impactCategory) return [];
    return getTopicsForClauseType(item.impactSubcategory || item.impactCategory);
  }, [item.impactCategory, item.impactSubcategory, getTopicsForClauseType]);

  const handleSaveVersion = () => {
    if (!activeContract || !newVersionLabel.trim()) return;
    saveVersion(activeContract.id, item, newVersionLabel.trim(), {
      round: newVersionRound,
      party: newVersionParty,
    });
    setNewVersionLabel('');
    // Increment round for next save if this was "their" proposal
    if (newVersionParty === 'them') {
      setNewVersionRound(prev => prev + 1);
      setNewVersionParty('us'); // Auto-switch to our counter
    }
  };

  const handleRestoreVersion = (version: ClauseVersion) => {
    if (!activeContract) return;
    restoreVersion(activeContract.id, item, version);
  };

  const handleDeleteVersion = (versionId: string) => {
    if (!activeContract) return;
    deleteVersion(activeContract.id, item, versionId);
  };

  const handleAddAnnotation = () => {
    if (!activeContract || !newAnnotation.text.trim()) return;
    addAnnotation(activeContract.id, item, {
      text: newAnnotation.text.trim(),
      type: newAnnotation.type,
    });
    setNewAnnotation({ text: '', type: 'note' });
  };

  const handleDeleteAnnotation = (annotationId: string) => {
    if (!activeContract) return;
    deleteAnnotation(activeContract.id, item, annotationId);
  };

  const versions = item.versions || [];
  const annotations = item.annotations || [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className={`${isFullscreen ? 'max-w-[95vw] h-[95vh]' : 'max-w-4xl max-h-[85vh]'} flex flex-col`}
      >
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="font-serif text-xl flex items-center gap-3">
                <span className="font-mono text-base text-muted-foreground">
                  {item.clauseNumber}
                </span>
                {item.issue}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  {diffStats.added} added
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {diffStats.removed} removed
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {diffStats.unchanged} unchanged
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="comparison" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="flex-shrink-0">
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
            <TabsTrigger value="versions" className="flex items-center gap-1">
              <History className="w-3.5 h-3.5" />
              Versions ({versions.length})
            </TabsTrigger>
            <TabsTrigger value="annotations" className="flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" />
              Notes ({annotations.length})
            </TabsTrigger>
            <TabsTrigger value="playbook" className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              Playbook
            </TabsTrigger>
          </TabsList>

          {/* Comparison Tab */}
          <TabsContent value="comparison" className="flex-1 overflow-hidden mt-4">
            <div className="flex items-center justify-end gap-2 mb-4">
              <Button
                variant={viewMode === 'inline' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('inline')}
              >
                Inline
              </Button>
              <Button
                variant={viewMode === 'side-by-side' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('side-by-side')}
              >
                Side by Side
              </Button>
            </div>

            <ScrollArea className="h-[calc(100%-3rem)]">
              {viewMode === 'inline' ? (
                <div className="p-4 bg-muted/30 rounded-lg font-serif text-sm leading-relaxed">
                  {diff.length === 0 ? (
                    <p className="text-muted-foreground italic">No text to compare</p>
                  ) : (
                    diff.map((word, index) => (
                      <span
                        key={index}
                        className={`${
                          word.type === 'added' 
                            ? 'bg-[oklch(0.88_0.10_145)] text-[oklch(0.25_0.10_145)] px-0.5 rounded' 
                            : word.type === 'removed'
                            ? 'bg-[oklch(0.88_0.10_15)] text-[oklch(0.35_0.12_15)] line-through px-0.5 rounded'
                            : ''
                        }`}
                      >
                        {word.text}{' '}
                      </span>
                    ))
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2 text-muted-foreground">Original Text</h4>
                    <div className="p-4 bg-muted/30 rounded-lg font-serif text-sm leading-relaxed min-h-[200px]">
                      {item.clauseText || <span className="text-muted-foreground italic">No original text</span>}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2 text-muted-foreground">Counter-Proposal</h4>
                    <div className="p-4 bg-muted/30 rounded-lg font-serif text-sm leading-relaxed min-h-[200px]">
                      {item.counterproposalWording || <span className="text-muted-foreground italic">No counter-proposal</span>}
                    </div>
                  </div>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* Versions Tab */}
          <TabsContent value="versions" className="flex-1 overflow-hidden mt-4">
            <div className="space-y-3 mb-4 p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Version label (e.g., 'After call with counterparty')"
                  value={newVersionLabel}
                  onChange={e => setNewVersionLabel(e.target.value)}
                  className="flex-1"
                />
              </div>
              <div className="flex items-center gap-2">
                <Select value={newVersionParty} onValueChange={(v) => setNewVersionParty(v as NegotiationParty)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Party" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="them">
                      <div className="flex items-center gap-2">
                        <Users className="w-3 h-3" />
                        Their Proposal
                      </div>
                    </SelectItem>
                    <SelectItem value="us">
                      <div className="flex items-center gap-2">
                        <User className="w-3 h-3" />
                        Our Counter
                      </div>
                    </SelectItem>
                    <SelectItem value="original">
                      <div className="flex items-center gap-2">
                        <History className="w-3 h-3" />
                        Original
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-muted-foreground">Round:</label>
                  <Input
                    type="number"
                    min="0"
                    value={newVersionRound}
                    onChange={e => setNewVersionRound(parseInt(e.target.value) || 0)}
                    className="w-20"
                  />
                </div>
                <Button onClick={handleSaveVersion} disabled={!newVersionLabel.trim()} className="ml-auto">
                  <Save className="w-4 h-4 mr-2" />
                  Save Version
                </Button>
              </div>
            </div>

            <ScrollArea className="h-[calc(100%-4rem)]">
              {versions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No versions saved yet</p>
                  <p className="text-sm">Save a version to track changes over time</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {versions.map(version => {
                    const partyInfo = getPartyDisplay(version.party);
                    const PartyIcon = partyInfo.icon;
                    
                    return (
                    <div 
                      key={version.id} 
                      className={`p-4 border rounded-lg ${
                        selectedVersionId === version.id ? 'border-[oklch(0.60_0.14_75)] bg-[oklch(0.92_0.06_75)]/30' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {version.round !== undefined && (
                              <Badge variant="outline" className="text-xs font-mono">
                                Round {version.round}
                              </Badge>
                            )}
                            {version.party && (
                              <Badge className={`text-xs ${partyInfo.color}`}>
                                <PartyIcon className="w-3 h-3 mr-1" />
                                {partyInfo.label}
                              </Badge>
                            )}
                          </div>
                          <h4 className="font-medium">{version.label}</h4>
                          <p className="text-xs text-muted-foreground">
                            {new Date(version.timestamp).toLocaleString()}
                          </p>
                          {version.notes && (
                            <p className="text-xs text-muted-foreground mt-1 italic">
                              {version.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedVersionId(
                              selectedVersionId === version.id ? null : version.id
                            )}
                          >
                            {selectedVersionId === version.id ? 'Hide' : 'View'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRestoreVersion(version)}
                          >
                            <RotateCcw className="w-3.5 h-3.5 mr-1" />
                            Restore
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteVersion(version.id)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      {selectedVersionId === version.id && (
                        <div className="mt-3 pt-3 border-t space-y-3">
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Original Text</p>
                            <p className="text-sm font-serif bg-muted/50 p-2 rounded">
                              {version.clauseText || '—'}
                            </p>
                          </div>
                          {version.proposedChange && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">Their Proposed Change</p>
                              <p className="text-sm font-serif bg-red-50 p-2 rounded border border-red-100">
                                {version.proposedChange}
                              </p>
                            </div>
                          )}
                          {version.counterProposal && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">Our Counter-Proposal</p>
                              <p className="text-sm font-serif bg-green-50 p-2 rounded border border-green-100">
                                {version.counterProposal}
                              </p>
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Counter-Proposal Wording</p>
                            <p className="text-sm font-serif bg-muted/50 p-2 rounded">
                              {version.counterproposalWording || '—'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                  })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* Annotations Tab */}
          <TabsContent value="annotations" className="flex-1 overflow-hidden mt-4">
            <div className="flex items-start gap-2 mb-4">
              <Textarea
                placeholder="Add a note, question, or important marker..."
                value={newAnnotation.text}
                onChange={e => setNewAnnotation(prev => ({ ...prev, text: e.target.value }))}
                className="flex-1"
                rows={2}
              />
              <div className="flex flex-col gap-2">
                <Select
                  value={newAnnotation.type}
                  onValueChange={(value: Annotation['type']) => 
                    setNewAnnotation(prev => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="note">Note</SelectItem>
                    <SelectItem value="question">Question</SelectItem>
                    <SelectItem value="important">Important</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleAddAnnotation} disabled={!newAnnotation.text.trim()}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
            </div>

            <ScrollArea className="h-[calc(100%-6rem)]">
              {annotations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No annotations yet</p>
                  <p className="text-sm">Add notes to track discussions and decisions</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {annotations.map(annotation => (
                    <div key={annotation.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                annotation.type === 'important' 
                                  ? 'border-[oklch(0.55_0.15_55)] text-[oklch(0.45_0.12_55)]'
                                  : annotation.type === 'question'
                                  ? 'border-[oklch(0.50_0.10_240)] text-[oklch(0.40_0.08_240)]'
                                  : ''
                              }`}
                            >
                              {annotation.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(annotation.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm">{annotation.text}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteAnnotation(annotation.id)}
                          className="text-muted-foreground hover:text-destructive shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* Playbook Tab */}
          <TabsContent value="playbook" className="flex-1 overflow-hidden mt-4">
            <ScrollArea className="h-full">
              {relatedPlaybook.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No playbook guidance found</p>
                  <p className="text-sm">
                    Set an impact category to see related negotiation guidance
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {relatedPlaybook.map(topic => (
                    <div key={topic.id} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline">{topic.category}</Badge>
                        <h4 className="font-serif font-medium">{topic.title}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">{topic.description}</p>

                      {topic.commonObjections.length > 0 && (
                        <div className="mb-4">
                          <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                            Common Objections
                          </h5>
                          <ul className="text-sm space-y-1">
                            {topic.commonObjections.map((obj, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-[oklch(0.55_0.15_55)]">•</span>
                                {obj}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {topic.positions.length > 0 && (
                        <div>
                          <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                            Negotiation Positions
                          </h5>
                          <div className="space-y-3">
                            {topic.positions.map(pos => (
                              <div key={pos.id} className="bg-muted/50 rounded-lg p-3">
                                <p className="font-medium text-sm mb-1">{pos.position}</p>
                                <p className="text-xs text-muted-foreground mb-2">{pos.rationale}</p>
                                {pos.fallback && (
                                  <p className="text-xs">
                                    <span className="font-medium text-[oklch(0.55_0.15_55)]">Fallback:</span>{' '}
                                    {pos.fallback}
                                  </p>
                                )}
                                {pos.redline && (
                                  <p className="text-xs mt-1">
                                    <span className="font-medium text-[oklch(0.40_0.12_15)]">Redline:</span>{' '}
                                    {pos.redline}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
