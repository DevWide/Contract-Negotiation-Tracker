// Playbook Topic Dialog - Edit or create playbook topics with positions and objections

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, 
  Trash2, 
  AlertTriangle,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import type { PlaybookTopic, PlaybookPosition } from '@/types';

interface PlaybookTopicDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topic: PlaybookTopic | null;
  existingCategories: string[];
  onSave: (topic: Omit<PlaybookTopic, 'id'> | PlaybookTopic) => void;
}

const DEFAULT_CATEGORIES = [
  'Liability',
  'Indemnification',
  'Termination',
  'Confidentiality',
  'Data Privacy',
  'Intellectual Property',
  'Payment Terms',
  'Warranties',
  'Dispute Resolution',
  'General',
];

export function PlaybookTopicDialog({
  open,
  onOpenChange,
  topic,
  existingCategories,
  onSave,
}: PlaybookTopicDialogProps) {
  const isEditing = !!topic;
  
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    description: '',
    commonObjections: [] as string[],
    positions: [] as PlaybookPosition[],
    relatedClauseTypes: [] as string[],
  });
  
  const [newObjection, setNewObjection] = useState('');
  const [newClauseType, setNewClauseType] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [expandedPositions, setExpandedPositions] = useState<string[]>([]);

  // Merge default and existing categories
  const allCategories = Array.from(new Set([...DEFAULT_CATEGORIES, ...existingCategories])).sort();

  useEffect(() => {
    if (topic) {
      setFormData({
        category: topic.category,
        title: topic.title,
        description: topic.description,
        commonObjections: [...topic.commonObjections],
        positions: topic.positions.map(p => ({ ...p })),
        relatedClauseTypes: [...topic.relatedClauseTypes],
      });
      // Expand first position by default
      if (topic.positions.length > 0) {
        setExpandedPositions([topic.positions[0].id]);
      }
    } else {
      setFormData({
        category: '',
        title: '',
        description: '',
        commonObjections: [],
        positions: [],
        relatedClauseTypes: [],
      });
      setExpandedPositions([]);
    }
    setNewObjection('');
    setNewClauseType('');
    setShowNewCategory(false);
    setNewCategory('');
  }, [topic, open]);

  const handleAddObjection = () => {
    if (!newObjection.trim()) return;
    setFormData(prev => ({
      ...prev,
      commonObjections: [...prev.commonObjections, newObjection.trim()],
    }));
    setNewObjection('');
  };

  const handleRemoveObjection = (index: number) => {
    setFormData(prev => ({
      ...prev,
      commonObjections: prev.commonObjections.filter((_, i) => i !== index),
    }));
  };

  const handleAddClauseType = () => {
    if (!newClauseType.trim()) return;
    if (formData.relatedClauseTypes.includes(newClauseType.trim())) return;
    setFormData(prev => ({
      ...prev,
      relatedClauseTypes: [...prev.relatedClauseTypes, newClauseType.trim()],
    }));
    setNewClauseType('');
  };

  const handleRemoveClauseType = (type: string) => {
    setFormData(prev => ({
      ...prev,
      relatedClauseTypes: prev.relatedClauseTypes.filter(t => t !== type),
    }));
  };

  const handleAddPosition = () => {
    const newPosition: PlaybookPosition = {
      id: `pos-${Date.now()}`,
      position: '',
      proposedChange: '',
      fallback: '',
      redline: '',
    };
    setFormData(prev => ({
      ...prev,
      positions: [...prev.positions, newPosition],
    }));
    setExpandedPositions(prev => [...prev, newPosition.id]);
  };

  const handleUpdatePosition = (id: string, updates: Partial<PlaybookPosition>) => {
    setFormData(prev => ({
      ...prev,
      positions: prev.positions.map(p =>
        p.id === id ? { ...p, ...updates } : p
      ),
    }));
  };

  const handleRemovePosition = (id: string) => {
    setFormData(prev => ({
      ...prev,
      positions: prev.positions.filter(p => p.id !== id),
    }));
    setExpandedPositions(prev => prev.filter(pid => pid !== id));
  };

  const togglePositionExpanded = (id: string) => {
    setExpandedPositions(prev =>
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    const categoryToUse = showNewCategory && newCategory.trim() 
      ? newCategory.trim() 
      : formData.category;
      
    if (!categoryToUse || !formData.title.trim()) return;

    const topicData = {
      ...formData,
      category: categoryToUse,
      title: formData.title.trim(),
      description: formData.description.trim(),
    };

    if (topic) {
      onSave({ ...topicData, id: topic.id });
    } else {
      onSave(topicData);
    }
    onOpenChange(false);
  };

  const isValid = (showNewCategory ? newCategory.trim() : formData.category) && formData.title.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl !p-0 !gap-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="font-serif text-xl">
            {isEditing ? 'Edit Playbook Topic' : 'New Playbook Topic'}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[calc(85vh-180px)] px-6">
          <div className="space-y-6 pb-4">
            {/* Category & Title */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category *</Label>
                {showNewCategory ? (
                  <div className="flex gap-2">
                    <Input
                      placeholder="New category name"
                      value={newCategory}
                      onChange={e => setNewCategory(e.target.value)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setShowNewCategory(false);
                        setNewCategory('');
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <Select
                    value={formData.category}
                    onValueChange={(value) => {
                      if (value === '__new__') {
                        setShowNewCategory(true);
                      } else {
                        setFormData(prev => ({ ...prev, category: value }));
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {allCategories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                      <SelectItem value="__new__">
                        <span className="flex items-center gap-2 text-primary">
                          <Plus className="w-4 h-4" />
                          Add new category
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  placeholder="e.g., Limitation of Liability"
                  value={formData.title}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Brief description of this negotiation topic..."
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
              />
            </div>

            {/* Related Clause Types */}
            <div className="space-y-2">
              <Label>Related Clause Types (for auto-matching)</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.relatedClauseTypes.map(type => (
                  <Badge key={type} variant="secondary" className="gap-1">
                    {type}
                    <button
                      onClick={() => handleRemoveClauseType(type)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add clause type..."
                  value={newClauseType}
                  onChange={e => setNewClauseType(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddClauseType())}
                />
                <Button variant="outline" onClick={handleAddClauseType} disabled={!newClauseType.trim()}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Common Objections */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[oklch(0.55_0.12_45)]" />
                Common Objections
              </Label>
              <div className="space-y-2">
                {formData.commonObjections.map((objection, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                    <span className="flex-1 text-sm">{objection}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveObjection(index)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add objection..."
                  value={newObjection}
                  onChange={e => setNewObjection(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddObjection())}
                />
                <Button variant="outline" onClick={handleAddObjection} disabled={!newObjection.trim()}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Negotiation Positions */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-[oklch(0.45_0.08_160)]" />
                  Negotiation Positions
                </Label>
                <Button variant="outline" size="sm" onClick={handleAddPosition}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Position
                </Button>
              </div>
              
              <div className="space-y-3">
                {formData.positions.map((position, index) => {
                  const isExpanded = expandedPositions.includes(position.id);
                  
                  return (
                    <div key={position.id} className="border rounded-lg">
                      <div
                        className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/30"
                        onClick={() => togglePositionExpanded(position.id)}
                      >
                        <div className="flex items-center gap-2">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          )}
                          <span className="font-medium">
                            Position {index + 1}
                            {position.position && (
                              <span className="font-normal text-muted-foreground ml-2">
                                - {position.position.slice(0, 40)}...
                              </span>
                            )}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemovePosition(position.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      {isExpanded && (
                        <div className="p-3 pt-0 space-y-3 border-t">
                          <div className="space-y-2">
                            <Label className="text-sm">Position</Label>
                            <Input
                              placeholder="Our standard position..."
                              value={position.position}
                              onChange={e => handleUpdatePosition(position.id, { position: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm">Rationale</Label>
                            <Textarea
                              placeholder="Why we take this position..."
                              value={position.proposedChange}
                              onChange={e => handleUpdatePosition(position.id, { proposedChange: e.target.value })}
                              rows={2}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm text-[oklch(0.55_0.12_45)]">Fallback</Label>
                            <Input
                              placeholder="Fallback position if they push back..."
                              value={position.fallback || ''}
                              onChange={e => handleUpdatePosition(position.id, { fallback: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm text-destructive">Red Line</Label>
                            <Input
                              placeholder="What we will never accept..."
                              value={position.redline || ''}
                              onChange={e => handleUpdatePosition(position.id, { redline: e.target.value })}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {formData.positions.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground border rounded-lg border-dashed">
                    No positions added yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="p-6 pt-4 border-t bg-background">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!isValid}
            className="bg-[oklch(0.45_0.08_160)] hover:bg-[oklch(0.50_0.08_160)]"
          >
            {isEditing ? 'Save Changes' : 'Create Topic'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
