// Contract Negotiation Tracker - ClauseForm Component
// Design: Organic Modern Professional - Form for adding/editing clause items
// Uses 3-Text Model: baselineText, theirPosition, ourPosition

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNegotiation } from '@/contexts/NegotiationContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Save, Plus, Info } from 'lucide-react';
import type { ClauseItem, ClauseStatus, Priority, RiskLevel, PaperSource } from '@/types';

interface ClauseFormProps {
  editingItem?: ClauseItem | null;
  onClose: () => void;
  onSaved?: () => void;
}

// Dynamic labels based on paper source
const getFieldLabels = (paperSource: PaperSource) => {
  if (paperSource === 'ours') {
    return {
      baseline: 'Our Template (Original Language)',
      baselineDesc: 'Paste our original contract/template language here',
      theirs: 'Their Markup (What They Changed)',
      theirsDesc: "Paste counterparty's proposed changes or markup",
      ours: 'Our Response (Accept/Reject/Counter)',
      oursDesc: 'Enter our proposed response or counter-language',
    };
  } else {
    return {
      baseline: 'Their Contract (Original Language)',
      baselineDesc: 'Paste their original contract language here',
      theirs: 'Their Position (Latest Response)',
      theirsDesc: "Counterparty's current stance (same as baseline in Round 1)",
      ours: 'Our Redlines (What We Want)',
      oursDesc: 'Enter our proposed redlines or counter-language',
    };
  }
};

const defaultFormData = {
  clauseNumber: '',
  topic: '',
  issue: '',
  rationale: '',
  baselineText: '',
  theirPosition: '',
  ourPosition: '',
  currentRound: 1,
  status: 'No Changes' as ClauseStatus,
  priority: 'Medium' as Priority,
  owner: 'Legal',
  impactCategory: '',
  impactSubcategory: '',
  riskLevel: 'medium' as RiskLevel,
};

export function ClauseForm({ editingItem, onClose, onSaved }: ClauseFormProps) {
  const { 
    activeContract, 
    addClauseItem, 
    updateClauseItem,
    formOptions,
    impactCategories,
    getSubcategories,
    addOwner,
    addImpactCategory,
    addSubcategory,
  } = useNegotiation();

  const [formData, setFormData] = useState(defaultFormData);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [showAddOwnerDialog, setShowAddOwnerDialog] = useState(false);
  const [showAddCategoryDialog, setShowAddCategoryDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddSubcategoryDialog, setShowAddSubcategoryDialog] = useState(false);
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [newOwnerName, setNewOwnerName] = useState('');
  const initialFormData = useRef(defaultFormData);
  
  // Get paper source for dynamic labels
  const paperSource: PaperSource = activeContract?.paperSource || 'ours';
  const labels = useMemo(() => getFieldLabels(paperSource), [paperSource]);

  // Check if form has unsaved changes
  const isDirty = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(initialFormData.current);
  }, [formData]);

  // Handle close with unsaved changes check
  const handleClose = useCallback(() => {
    if (isDirty) {
      setShowUnsavedWarning(true);
    } else {
      onClose();
    }
  }, [isDirty, onClose]);

  const handleConfirmClose = () => {
    setShowUnsavedWarning(false);
    onClose();
  };

  useEffect(() => {
    if (editingItem) {
      const editData = {
        clauseNumber: editingItem.clauseNumber,
        topic: editingItem.topic,
        issue: editingItem.issue,
        rationale: editingItem.rationale || '',
        baselineText: editingItem.baselineText,
        theirPosition: editingItem.theirPosition,
        ourPosition: editingItem.ourPosition,
        currentRound: editingItem.currentRound || 1,
        status: editingItem.status,
        priority: editingItem.priority,
        owner: editingItem.owner,
        impactCategory: editingItem.impactCategory,
        impactSubcategory: editingItem.impactSubcategory,
        riskLevel: editingItem.riskLevel,
      };
      setFormData(editData);
      initialFormData.current = editData;
    } else {
      setFormData(defaultFormData);
      initialFormData.current = defaultFormData;
    }
  }, [editingItem]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeContract) return;

    if (editingItem) {
      updateClauseItem(activeContract.id, editingItem.id, formData);
    } else {
      addClauseItem(activeContract.id, formData);
    }

    setFormData(defaultFormData);
    onSaved?.();
    if (!editingItem) {
      // Keep form open for adding more items
    } else {
      onClose();
    }
  };

  const subcategories = formData.impactCategory 
    ? getSubcategories(formData.impactCategory) 
    : [];

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="font-serif text-lg">
            {editingItem ? 'Edit Clause' : 'Add New Clause'}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Row 1: Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clauseNumber">Clause Number</Label>
              <Input
                id="clauseNumber"
                placeholder="e.g., 5.1"
                value={formData.clauseNumber}
                onChange={e => setFormData(prev => ({ ...prev, clauseNumber: e.target.value }))}
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="topic">Topic *</Label>
              <Input
                id="topic"
                placeholder="e.g., Liability"
                value={formData.topic}
                onChange={e => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentRound">Round</Label>
              <Input
                id="currentRound"
                type="number"
                min={1}
                value={formData.currentRound}
                onChange={e => setFormData(prev => ({ ...prev, currentRound: parseInt(e.target.value) || 1 }))}
                className="font-mono"
              />
            </div>
          </div>

          {/* Row 2: Baseline Text */}
          <div className="space-y-2">
            <Label htmlFor="baselineText" className="flex items-center gap-2">
              {labels.baseline}
              {editingItem && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Rarely changes after creation
                </span>
              )}
            </Label>
            <Textarea
              id="baselineText"
              placeholder={labels.baselineDesc}
              value={formData.baselineText}
              onChange={e => setFormData(prev => ({ ...prev, baselineText: e.target.value }))}
              rows={4}
              className="font-serif text-sm"
            />
          </div>

          {/* Row 3: Their Position & Our Position */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="theirPosition">{labels.theirs}</Label>
              <Textarea
                id="theirPosition"
                placeholder={labels.theirsDesc}
                value={formData.theirPosition}
                onChange={e => setFormData(prev => ({ ...prev, theirPosition: e.target.value }))}
                rows={4}
                className="font-serif text-sm"
              />
              {paperSource === 'counterparty' && !editingItem && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    id="copyBaseline"
                    checked={formData.theirPosition === formData.baselineText && formData.baselineText !== ''}
                    onChange={(e) => {
                      if (e.target.checked && formData.baselineText) {
                        setFormData(prev => ({ ...prev, theirPosition: prev.baselineText }));
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="copyBaseline">Same as baseline (awaiting their response)</label>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="ourPosition">{labels.ours}</Label>
              <Textarea
                id="ourPosition"
                placeholder={labels.oursDesc}
                value={formData.ourPosition}
                onChange={e => setFormData(prev => ({ ...prev, ourPosition: e.target.value }))}
                rows={4}
                className="font-serif text-sm"
              />
            </div>
          </div>

          {/* Row 4: Issue & Rationale */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="issue">Issue Summary *</Label>
              <Textarea
                id="issue"
                placeholder="Brief summary of what's being negotiated..."
                value={formData.issue}
                onChange={e => setFormData(prev => ({ ...prev, issue: e.target.value }))}
                rows={2}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rationale">Our Rationale</Label>
              <Textarea
                id="rationale"
                placeholder="Why we're taking this position..."
                value={formData.rationale}
                onChange={e => setFormData(prev => ({ ...prev, rationale: e.target.value }))}
                rows={2}
              />
            </div>
          </div>

          {/* Row 5: Status, Priority, Owner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: ClauseStatus) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {formOptions.statuses.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: Priority) => setFormData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {formOptions.priorities.map(priority => (
                    <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Owner</Label>
              <Select
                value={formData.owner}
                onValueChange={(value: string) => {
                  if (value === '__add_new__') {
                    setShowAddOwnerDialog(true);
                  } else {
                    setFormData(prev => ({ ...prev, owner: value }));
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {formOptions.owners.map(owner => (
                    <SelectItem key={owner} value={owner}>{owner}</SelectItem>
                  ))}
                  <SelectSeparator />
                  <SelectItem value="__add_new__" className="text-muted-foreground italic">
                    <span className="flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5" />
                      Add new...
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Risk Level</Label>
              <Select
                value={formData.riskLevel}
                onValueChange={(value: RiskLevel) => setFormData(prev => ({ ...prev, riskLevel: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 6: Impact Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Impact Category</Label>
              <Select
                value={formData.impactCategory}
                onValueChange={(value: string) => {
                  if (value === '__add_new__') {
                    setShowAddCategoryDialog(true);
                  } else {
                    setFormData(prev => ({ 
                      ...prev, 
                      impactCategory: value,
                      impactSubcategory: '' 
                    }));
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {impactCategories.map(cat => (
                    <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                  ))}
                  <SelectSeparator />
                  <SelectItem value="__add_new__" className="text-muted-foreground italic">
                    <span className="flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5" />
                      Add new...
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Subcategory</Label>
              <Select
                value={formData.impactSubcategory}
                onValueChange={(value: string) => {
                  if (value === '__add_new__') {
                    setShowAddSubcategoryDialog(true);
                  } else {
                    setFormData(prev => ({ ...prev, impactSubcategory: value }));
                  }
                }}
                disabled={!formData.impactCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subcategory" />
                </SelectTrigger>
                <SelectContent>
                  {subcategories.map(sub => (
                    <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                  ))}
                  <SelectSeparator />
                  <SelectItem value="__add_new__" className="text-muted-foreground italic">
                    <span className="flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5" />
                      Add new...
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-primary hover:bg-primary/90"
            >
              {editingItem ? (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Clause
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>

      {/* Unsaved Changes Warning Dialog */}
      <AlertDialog open={showUnsavedWarning} onOpenChange={setShowUnsavedWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to close without saving?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Editing</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmClose} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add New Owner Dialog */}
      <Dialog open={showAddOwnerDialog} onOpenChange={setShowAddOwnerDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Add New Owner</DialogTitle>
            <DialogDescription>
              Add a new owner option for clause assignments.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="form-new-owner-name">Owner Name</Label>
            <Input
              id="form-new-owner-name"
              value={newOwnerName}
              onChange={(e) => setNewOwnerName(e.target.value)}
              placeholder="e.g., Marketing, Engineering..."
              className="mt-2"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newOwnerName.trim()) {
                  addOwner(newOwnerName.trim());
                  setFormData(prev => ({ ...prev, owner: newOwnerName.trim() }));
                  setNewOwnerName('');
                  setShowAddOwnerDialog(false);
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setNewOwnerName('');
              setShowAddOwnerDialog(false);
            }}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (newOwnerName.trim()) {
                  addOwner(newOwnerName.trim());
                  setFormData(prev => ({ ...prev, owner: newOwnerName.trim() }));
                  setNewOwnerName('');
                  setShowAddOwnerDialog(false);
                }
              }}
              disabled={!newOwnerName.trim()}
            >
              Add Owner
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add New Category Dialog */}
      <Dialog open={showAddCategoryDialog} onOpenChange={setShowAddCategoryDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>
              Add a new impact category for clause classification.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="form-new-category-name">Category Name</Label>
            <Input
              id="form-new-category-name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="e.g., Technical, Governance..."
              className="mt-2"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newCategoryName.trim()) {
                  addImpactCategory(newCategoryName.trim());
                  setFormData(prev => ({ ...prev, impactCategory: newCategoryName.trim(), impactSubcategory: '' }));
                  setNewCategoryName('');
                  setShowAddCategoryDialog(false);
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setNewCategoryName('');
              setShowAddCategoryDialog(false);
            }}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (newCategoryName.trim()) {
                  addImpactCategory(newCategoryName.trim());
                  setFormData(prev => ({ ...prev, impactCategory: newCategoryName.trim(), impactSubcategory: '' }));
                  setNewCategoryName('');
                  setShowAddCategoryDialog(false);
                }
              }}
              disabled={!newCategoryName.trim()}
            >
              Add Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add New Subcategory Dialog */}
      <Dialog open={showAddSubcategoryDialog} onOpenChange={setShowAddSubcategoryDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Add New Subcategory</DialogTitle>
            <DialogDescription>
              Add a new subcategory under "{formData.impactCategory}".
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="form-new-subcategory-name">Subcategory Name</Label>
            <Input
              id="form-new-subcategory-name"
              value={newSubcategoryName}
              onChange={(e) => setNewSubcategoryName(e.target.value)}
              placeholder="e.g., Data Protection, Audit..."
              className="mt-2"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newSubcategoryName.trim() && formData.impactCategory) {
                  addSubcategory(formData.impactCategory, newSubcategoryName.trim());
                  setFormData(prev => ({ ...prev, impactSubcategory: newSubcategoryName.trim() }));
                  setNewSubcategoryName('');
                  setShowAddSubcategoryDialog(false);
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setNewSubcategoryName('');
              setShowAddSubcategoryDialog(false);
            }}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (newSubcategoryName.trim() && formData.impactCategory) {
                  addSubcategory(formData.impactCategory, newSubcategoryName.trim());
                  setFormData(prev => ({ ...prev, impactSubcategory: newSubcategoryName.trim() }));
                  setNewSubcategoryName('');
                  setShowAddSubcategoryDialog(false);
                }
              }}
              disabled={!newSubcategoryName.trim()}
            >
              Add Subcategory
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
