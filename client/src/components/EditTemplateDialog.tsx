// Contract Negotiation Tracker - Edit Template Dialog
// Allows editing template details and managing clauses

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, Plus, FileText, BookOpen, Save, X } from 'lucide-react';
import type { Template, TemplateClause } from '@/types';

interface EditTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: Template | null;
  onSave: (templateId: string, updates: Partial<Template>) => void;
  onAddClause: (templateId: string, clause: Omit<TemplateClause, 'id'>) => void;
  onUpdateClause: (templateId: string, clauseId: string, updates: Partial<TemplateClause>) => void;
  onDeleteClause: (templateId: string, clauseId: string) => void;
}

interface EditableClause extends TemplateClause {
  isNew?: boolean;
}

export function EditTemplateDialog({
  open,
  onOpenChange,
  template,
  onSave,
  onAddClause,
  onUpdateClause,
  onDeleteClause,
}: EditTemplateDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [clauses, setClauses] = useState<EditableClause[]>([]);
  const [expandedClause, setExpandedClause] = useState<string>('');
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize state when template changes
  useEffect(() => {
    if (template) {
      setName(template.name);
      setDescription(template.description);
      setClauses(template.clauses.map(c => ({ ...c })));
      setHasChanges(false);
      setExpandedClause('');
    }
  }, [template]);

  if (!template) return null;

  const handleNameChange = (value: string) => {
    setName(value);
    setHasChanges(true);
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    setHasChanges(true);
  };

  const handleClauseChange = (clauseId: string, field: keyof TemplateClause, value: string) => {
    setClauses(prev => prev.map(c =>
      c.id === clauseId ? { ...c, [field]: value } : c
    ));
    setHasChanges(true);
  };

  const handleAddClause = () => {
    const newClause: EditableClause = {
      id: `new-${Date.now()}`,
      clauseNumber: `${clauses.length + 1}`,
      topic: 'General',
      baselineText: '',
      theirPosition: '',
      ourPosition: '',
      issue: '',
      rationale: '',
      impactCategory: 'General',
      impactSubcategory: '',
      isNew: true,
    };
    setClauses(prev => [...prev, newClause]);
    setExpandedClause(newClause.id);
    setHasChanges(true);
  };

  const handleDeleteClause = (clauseId: string) => {
    const clause = clauses.find(c => c.id === clauseId);
    setClauses(prev => prev.filter(c => c.id !== clauseId));
    setHasChanges(true);
    
    // If it's an existing clause (not new), mark for deletion
    if (clause && !clause.isNew) {
      onDeleteClause(template.id, clauseId);
    }
  };

  const handleSave = () => {
    // Save template name/description
    if (name !== template.name || description !== template.description) {
      onSave(template.id, { name, description });
    }

    // Save clause changes
    clauses.forEach(clause => {
      if (clause.isNew) {
        // Add new clause
        const { id, isNew, ...clauseData } = clause;
        onAddClause(template.id, clauseData);
      } else {
        // Check if clause was modified
        const original = template.clauses.find(c => c.id === clause.id);
        if (original) {
          const hasClauseChanges = Object.keys(clause).some(key => {
            const k = key as keyof TemplateClause;
            return clause[k] !== original[k];
          });
          if (hasClauseChanges) {
            onUpdateClause(template.id, clause.id, clause);
          }
        }
      }
    });

    setHasChanges(false);
    onOpenChange(false);
  };

  const handleCancel = () => {
    // Reset to original state
    if (template) {
      setName(template.name);
      setDescription(template.description);
      setClauses(template.clauses.map(c => ({ ...c })));
    }
    setHasChanges(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Edit Template
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 space-y-4">
          {/* Template Name & Description */}
          <div className="grid gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                value={name}
                onChange={e => handleNameChange(e.target.value)}
                placeholder="Enter template name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="template-desc">Description</Label>
              <Textarea
                id="template-desc"
                value={description}
                onChange={e => handleDescriptionChange(e.target.value)}
                placeholder="Template description (optional)"
                rows={2}
              />
            </div>
          </div>

          {/* Clauses Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Clauses ({clauses.length})</Label>
              <Button variant="outline" size="sm" onClick={handleAddClause}>
                <Plus className="w-4 h-4 mr-1" />
                Add Clause
              </Button>
            </div>

            <ScrollArea className="h-[300px] border rounded-lg">
              {clauses.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                  <FileText className="w-10 h-10 mb-2 opacity-50" />
                  <p>No clauses yet</p>
                  <Button variant="link" size="sm" onClick={handleAddClause}>
                    Add your first clause
                  </Button>
                </div>
              ) : (
                <Accordion
                  type="single"
                  collapsible
                  value={expandedClause}
                  onValueChange={setExpandedClause}
                  className="px-1"
                >
                  {clauses.map((clause, index) => (
                    <AccordionItem key={clause.id} value={clause.id} className="border-b last:border-b-0">
                      <AccordionTrigger className="hover:no-underline py-3 px-2">
                        <div className="flex items-center gap-3 text-left">
                          <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                            {clause.clauseNumber || index + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {clause.issue || 'Untitled Clause'}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {clause.baselineText?.slice(0, 60) || 'No content'}
                              {clause.baselineText && clause.baselineText.length > 60 && '...'}
                            </p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-2 pb-4">
                        <Tabs defaultValue="content" className="w-full">
                          <TabsList className="mb-3">
                            <TabsTrigger value="content" className="text-xs">
                              <FileText className="w-3 h-3 mr-1" />
                              Content
                            </TabsTrigger>
                            <TabsTrigger value="playbook" className="text-xs">
                              <BookOpen className="w-3 h-3 mr-1" />
                              Playbook
                            </TabsTrigger>
                          </TabsList>

                          <TabsContent value="content" className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1.5">
                                <Label className="text-xs">Clause #</Label>
                                <Input
                                  value={clause.clauseNumber}
                                  onChange={e => handleClauseChange(clause.id, 'clauseNumber', e.target.value)}
                                  placeholder="e.g., 1.1"
                                  className="h-8"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <Label className="text-xs">Topic/Issue</Label>
                                <Input
                                  value={clause.issue}
                                  onChange={e => handleClauseChange(clause.id, 'issue', e.target.value)}
                                  placeholder="e.g., Liability Cap"
                                  className="h-8"
                                />
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs">Baseline Text</Label>
                              <Textarea
                                value={clause.baselineText}
                                onChange={e => handleClauseChange(clause.id, 'baselineText', e.target.value)}
                                placeholder="Full clause text..."
                                rows={3}
                                className="text-sm"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs">Impact Category</Label>
                              <Input
                                value={clause.impactCategory}
                                onChange={e => handleClauseChange(clause.id, 'impactCategory', e.target.value)}
                                placeholder="e.g., Commercial, Legal"
                                className="h-8"
                              />
                            </div>
                          </TabsContent>

                          <TabsContent value="playbook" className="space-y-3">
                            <div className="space-y-1.5">
                              <Label className="text-xs">Their Position</Label>
                              <Textarea
                                value={clause.theirPosition}
                                onChange={e => handleClauseChange(clause.id, 'theirPosition', e.target.value)}
                                placeholder="Counterparty's proposed position..."
                                rows={2}
                                className="text-sm"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs">Our Position</Label>
                              <Textarea
                                value={clause.ourPosition}
                                onChange={e => handleClauseChange(clause.id, 'ourPosition', e.target.value)}
                                placeholder="Our proposed position..."
                                rows={2}
                                className="text-sm"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs">Rationale</Label>
                              <Textarea
                                value={clause.rationale}
                                onChange={e => handleClauseChange(clause.id, 'rationale', e.target.value)}
                                placeholder="Why we're taking this position..."
                                rows={2}
                                className="text-sm"
                              />
                            </div>
                          </TabsContent>
                        </Tabs>

                        <div className="flex justify-end mt-3 pt-3 border-t">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClause(clause.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete Clause
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleCancel}>
            <X className="w-4 h-4 mr-1" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges && !name.trim()}>
            <Save className="w-4 h-4 mr-1" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
