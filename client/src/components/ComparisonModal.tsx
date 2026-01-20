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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
  User,
  Pencil,
  Check,
} from 'lucide-react';
import { computeDiff, getDiffStats } from '@/lib/textDiff';
import type { ClauseItem, ClauseVersion, Annotation, NegotiationParty } from '@/types';

// 3-way diff pair options
type DiffPair = 'baseline-theirs' | 'theirs-ours' | 'baseline-ours';

const DIFF_PAIR_LABELS: Record<DiffPair, { left: string; right: string; label: string }> = {
  'baseline-theirs': { left: 'Baseline', right: 'Their Position', label: 'Baseline ↔ Theirs' },
  'theirs-ours': { left: 'Their Position', right: 'Our Position', label: 'Theirs ↔ Ours' },
  'baseline-ours': { left: 'Baseline', right: 'Our Position', label: 'Baseline ↔ Ours' },
};

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
    updateAnnotation,
    deleteAnnotation,
    getTopicsForClauseType,
    getCurrentRound,
  } = useNegotiation();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState<'inline' | 'side-by-side'>('inline');
  const [diffPair, setDiffPair] = useState<DiffPair>('baseline-theirs');
  const [newVersionLabel, setNewVersionLabel] = useState('');
  const [newVersionParty, setNewVersionParty] = useState<NegotiationParty>('us');
  const [newVersionRound, setNewVersionRound] = useState(0);
  const [newAnnotation, setNewAnnotation] = useState({ text: '', type: 'note' as Annotation['type'] });
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [editingAnnotationId, setEditingAnnotationId] = useState<string | null>(null);
  const [editingAnnotationText, setEditingAnnotationText] = useState('');
  const [showRedlines, setShowRedlines] = useState(true);
  const [restorePreviewVersion, setRestorePreviewVersion] = useState<ClauseVersion | null>(null);

  // Update round when item changes
  useMemo(() => {
    const currentRound = getCurrentRound(item);
    setNewVersionRound(currentRound);
  }, [item, getCurrentRound]);

  useEscapeKey(onClose, open);

  // Get the texts for the selected diff pair
  const getDiffTexts = (pair: DiffPair): { left: string; right: string } => {
    switch (pair) {
      case 'baseline-theirs':
        return { left: item.baselineText || '', right: item.theirPosition || '' };
      case 'theirs-ours':
        return { left: item.theirPosition || '', right: item.ourPosition || '' };
      case 'baseline-ours':
        return { left: item.baselineText || '', right: item.ourPosition || '' };
    }
  };

  const diffTexts = getDiffTexts(diffPair);
  const diff = useMemo(() => {
    return computeDiff(diffTexts.left, diffTexts.right);
  }, [diffTexts.left, diffTexts.right]);

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
    // Show preview dialog before restoring
    setRestorePreviewVersion(version);
  };

  const handleConfirmRestore = () => {
    if (!activeContract || !restorePreviewVersion) return;
    restoreVersion(activeContract.id, item, restorePreviewVersion);
    setRestorePreviewVersion(null);
  };

  const handleCancelRestore = () => {
    setRestorePreviewVersion(null);
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

  const handleStartEditAnnotation = (annotation: Annotation) => {
    setEditingAnnotationId(annotation.id);
    setEditingAnnotationText(annotation.text);
  };

  const handleSaveEditAnnotation = () => {
    if (!activeContract || !editingAnnotationId || !editingAnnotationText.trim()) return;
    updateAnnotation(activeContract.id, item, editingAnnotationId, {
      text: editingAnnotationText.trim(),
    });
    setEditingAnnotationId(null);
    setEditingAnnotationText('');
  };

  const handleCancelEditAnnotation = () => {
    setEditingAnnotationId(null);
    setEditingAnnotationText('');
  };

  const versions = item.versions || [];
  const annotations = item.annotations || [];

  return (
    <>
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className={`${isFullscreen ? 'max-w-[95vw] h-[95vh]' : 'max-w-4xl h-[85vh]'} flex flex-col`}
        showCloseButton={false}
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
          <TabsContent value="comparison" className="flex-1 flex flex-col min-h-0 mt-4">
            <div className="flex-shrink-0 flex flex-wrap items-end gap-4 mb-4">
              {/* Diff Pair Selection */}
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Compare</span>
                <div className="flex flex-wrap items-center gap-1 bg-muted/50 rounded-lg p-1">
                  {(Object.entries(DIFF_PAIR_LABELS) as [DiffPair, typeof DIFF_PAIR_LABELS[DiffPair]][]).map(([key, value]) => (
                    <Button
                      key={key}
                      variant={diffPair === key ? 'secondary' : 'ghost'}
                      size="sm"
                      className="text-xs"
                      onClick={() => setDiffPair(key)}
                    >
                      {value.label}
                    </Button>
                  ))}
                </div>
              </div>
              {/* View Mode Toggle */}
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">View</span>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
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
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <Switch
                      id="show-redlines"
                      checked={showRedlines}
                      onCheckedChange={setShowRedlines}
                    />
                    <Label htmlFor="show-redlines" className="text-sm cursor-pointer">
                      Redlines
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-hidden">
              <ScrollArea className="h-full">
                {viewMode === 'inline' ? (
                  <div className="p-4 bg-muted/30 rounded-lg font-serif text-sm leading-relaxed">
                    {diff.length === 0 ? (
                      <p className="text-muted-foreground italic">No text to compare</p>
                    ) : showRedlines ? (
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
                  ) : (
                    // Show only the final text (skip removed words)
                    diff.filter(word => word.type !== 'removed').map((word, index) => (
                      <span key={index}>{word.text}{' '}</span>
                    ))
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2 text-muted-foreground">{DIFF_PAIR_LABELS[diffPair].left}</h4>
                    <div className="p-4 bg-muted/30 rounded-lg font-serif text-sm leading-relaxed min-h-[200px]">
                      {diff.length === 0 ? (
                        <span className="text-muted-foreground italic">No text</span>
                      ) : showRedlines ? (
                        diff.map((word, index) => (
                          word.type !== 'added' && (
                            <span
                              key={index}
                              className={`${
                                word.type === 'removed' 
                                  ? 'bg-[oklch(0.88_0.10_15)] text-[oklch(0.35_0.12_15)] line-through px-0.5 rounded'
                                  : ''
                              }`}
                            >
                              {word.text}{' '}
                            </span>
                          )
                        ))
                      ) : (
                        // Show plain text without highlighting
                        diff.filter(word => word.type !== 'added').map((word, index) => (
                          <span key={index}>{word.text}{' '}</span>
                        ))
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2 text-muted-foreground">{DIFF_PAIR_LABELS[diffPair].right}</h4>
                    <div className="p-4 bg-muted/30 rounded-lg font-serif text-sm leading-relaxed min-h-[200px]">
                      {diff.length === 0 ? (
                        <span className="text-muted-foreground italic">No text</span>
                      ) : showRedlines ? (
                        diff.map((word, index) => (
                          word.type !== 'removed' && (
                            <span
                              key={index}
                              className={`${
                                word.type === 'added' 
                                  ? 'bg-[oklch(0.88_0.10_145)] text-[oklch(0.30_0.10_145)] px-0.5 rounded'
                                  : ''
                              }`}
                            >
                              {word.text}{' '}
                            </span>
                          )
                        ))
                      ) : (
                        // Show plain text without highlighting
                        diff.filter(word => word.type !== 'removed').map((word, index) => (
                          <span key={index}>{word.text}{' '}</span>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
              </ScrollArea>
            </div>
          </TabsContent>

          {/* Versions Tab */}
          <TabsContent value="versions" className="flex-1 flex flex-col min-h-0 mt-4">
            <div className="flex-shrink-0 space-y-3 mb-4 p-4 border rounded-lg bg-muted/30">
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

            <div className="flex-1 min-h-0 overflow-hidden">
              <ScrollArea className="h-full">
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
                            <p className="text-xs font-medium text-muted-foreground mb-1">Baseline Text</p>
                            <p className="text-sm font-serif bg-muted/50 p-2 rounded">
                              {version.baselineText || '—'}
                            </p>
                          </div>
                          {version.theirPosition && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">Their Position <span className="text-xs font-normal">(changes from baseline)</span></p>
                              <div className="text-sm font-serif bg-red-50 p-2 rounded border border-red-100 leading-relaxed">
                                {(() => {
                                  const versionDiff = computeDiff(version.baselineText || '', version.theirPosition);
                                  if (versionDiff.length === 0) return version.theirPosition;
                                  return versionDiff.map((word, idx) => (
                                    <span
                                      key={idx}
                                      className={`${
                                        word.type === 'added' 
                                          ? 'bg-red-200 text-red-900 px-0.5 rounded font-medium' 
                                          : word.type === 'removed'
                                          ? 'bg-red-100 text-red-400 line-through px-0.5 rounded'
                                          : ''
                                      }`}
                                    >
                                      {word.text}{' '}
                                    </span>
                                  ));
                                })()}
                              </div>
                            </div>
                          )}
                          {version.ourPosition && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">Our Position <span className="text-xs font-normal">(changes from their position)</span></p>
                              <div className="text-sm font-serif bg-green-50 p-2 rounded border border-green-100 leading-relaxed">
                                {(() => {
                                  const versionDiff = computeDiff(version.theirPosition || version.baselineText || '', version.ourPosition);
                                  if (versionDiff.length === 0) return version.ourPosition;
                                  return versionDiff.map((word, idx) => (
                                    <span
                                      key={idx}
                                      className={`${
                                        word.type === 'added' 
                                          ? 'bg-green-200 text-green-900 px-0.5 rounded font-medium' 
                                          : word.type === 'removed'
                                          ? 'bg-green-100 text-green-400 line-through px-0.5 rounded'
                                          : ''
                                      }`}
                                    >
                                      {word.text}{' '}
                                    </span>
                                  ));
                                })()}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                  })}
                </div>
              )}
            </ScrollArea>
            </div>
          </TabsContent>

          {/* Annotations Tab */}
          <TabsContent value="annotations" className="flex-1 flex flex-col overflow-hidden mt-4">
            <div className="flex-shrink-0 flex items-start gap-2 mb-4">
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

            <div className="flex-1 min-h-0 overflow-hidden">
              <ScrollArea className="h-full">
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
                          {editingAnnotationId === annotation.id ? (
                            <div className="flex items-start gap-2 mt-1">
                              <Textarea
                                value={editingAnnotationText}
                                onChange={e => setEditingAnnotationText(e.target.value)}
                                className="flex-1 text-sm"
                                rows={2}
                                autoFocus
                              />
                              <div className="flex flex-col gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={handleSaveEditAnnotation}
                                  disabled={!editingAnnotationText.trim()}
                                  className="text-[oklch(0.45_0.12_145)] hover:text-[oklch(0.35_0.12_145)] shrink-0"
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={handleCancelEditAnnotation}
                                  className="text-muted-foreground hover:text-foreground shrink-0"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm">{annotation.text}</p>
                          )}
                        </div>
                        <div className="flex flex-col gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleStartEditAnnotation(annotation)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteAnnotation(annotation.id)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              </ScrollArea>
            </div>
          </TabsContent>

          {/* Playbook Tab */}
          <TabsContent value="playbook" className="flex-1 min-h-0 overflow-hidden mt-4">
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

    {/* Version Restore Preview Dialog */}
    <AlertDialog open={!!restorePreviewVersion} onOpenChange={(open) => !open && handleCancelRestore()}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Restore Version: {restorePreviewVersion?.label}</AlertDialogTitle>
          <AlertDialogDescription>
            This will restore your positions to the saved version from {restorePreviewVersion?.savedAt ? new Date(restorePreviewVersion.savedAt).toLocaleString() : ''}.
            Your current state will be saved as a backup version.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        {restorePreviewVersion && (
          <div className="space-y-4 max-h-[50vh] overflow-y-auto">
            {/* Their Position Changes */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">Their Position</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border p-3 bg-muted/30">
                  <span className="text-xs text-muted-foreground block mb-1">Current</span>
                  <p className="text-sm whitespace-pre-wrap">{item.theirPosition || <em className="text-muted-foreground">Empty</em>}</p>
                </div>
                <div className="rounded-lg border p-3 bg-primary/5 border-primary/20">
                  <span className="text-xs text-primary block mb-1">After Restore</span>
                  <p className="text-sm whitespace-pre-wrap">{restorePreviewVersion.snapshot.theirPosition || <em className="text-muted-foreground">Empty</em>}</p>
                </div>
              </div>
            </div>

            {/* Our Position Changes */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">Our Position</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border p-3 bg-muted/30">
                  <span className="text-xs text-muted-foreground block mb-1">Current</span>
                  <p className="text-sm whitespace-pre-wrap">{item.ourPosition || <em className="text-muted-foreground">Empty</em>}</p>
                </div>
                <div className="rounded-lg border p-3 bg-primary/5 border-primary/20">
                  <span className="text-xs text-primary block mb-1">After Restore</span>
                  <p className="text-sm whitespace-pre-wrap">{restorePreviewVersion.snapshot.ourPosition || <em className="text-muted-foreground">Empty</em>}</p>
                </div>
              </div>
            </div>

            {/* Round Info */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline">Round {restorePreviewVersion.round}</Badge>
              <span>•</span>
              <span className="capitalize">{restorePreviewVersion.party === 'us' ? 'Our' : 'Their'} version</span>
            </div>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancelRestore}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirmRestore}>Restore Version</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
