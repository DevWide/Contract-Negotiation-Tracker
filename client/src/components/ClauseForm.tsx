// Contract Negotiation Tracker - ClauseForm Component
// Design: Refined Legal Elegance - Form for adding/editing clause items

import { useState, useEffect } from 'react';
import { useNegotiation } from '@/contexts/NegotiationContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Save, Plus } from 'lucide-react';
import type { ClauseItem, ClauseStatus, Priority, RiskLevel } from '@/types';

interface ClauseFormProps {
  editingItem?: ClauseItem | null;
  onClose: () => void;
  onSaved?: () => void;
}

const defaultFormData = {
  clauseNumber: '',
  clauseText: '',
  topic: '',
  issue: '',
  proposedChange: '',
  counterProposal: '',
  counterproposalWording: '',
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
  } = useNegotiation();

  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    if (editingItem) {
      setFormData({
        clauseNumber: editingItem.clauseNumber,
        clauseText: editingItem.clauseText,
        topic: editingItem.topic,
        issue: editingItem.issue,
        proposedChange: editingItem.proposedChange,
        counterProposal: editingItem.counterProposal,
        counterproposalWording: editingItem.counterproposalWording,
        status: editingItem.status,
        priority: editingItem.priority,
        owner: editingItem.owner,
        impactCategory: editingItem.impactCategory,
        impactSubcategory: editingItem.impactSubcategory,
        riskLevel: editingItem.riskLevel,
      });
    } else {
      setFormData(defaultFormData);
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
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Row 1: Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
            <div className="space-y-2 md:col-span-3">
              <Label htmlFor="issue">Issue *</Label>
              <Input
                id="issue"
                placeholder="Brief description of the negotiation issue"
                value={formData.issue}
                onChange={e => setFormData(prev => ({ ...prev, issue: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* Row 2: Original Clause Text */}
          <div className="space-y-2">
            <Label htmlFor="clauseText">Original Clause Text</Label>
            <Textarea
              id="clauseText"
              placeholder="Paste the original clause language here..."
              value={formData.clauseText}
              onChange={e => setFormData(prev => ({ ...prev, clauseText: e.target.value }))}
              rows={4}
              className="font-serif text-sm"
            />
          </div>

          {/* Row 3: Proposed Change */}
          <div className="space-y-2">
            <Label htmlFor="proposedChange">Proposed Change</Label>
            <Textarea
              id="proposedChange"
              placeholder="Explain why this clause needs attention..."
              value={formData.proposedChange}
              onChange={e => setFormData(prev => ({ ...prev, proposedChange: e.target.value }))}
              rows={2}
            />
          </div>

          {/* Row 4: Counter-Proposal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="counterProposal">Counter-Proposal Summary</Label>
              <Textarea
                id="counterProposal"
                placeholder="Brief summary of proposed changes..."
                value={formData.counterProposal}
                onChange={e => setFormData(prev => ({ ...prev, counterProposal: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="counterproposalWording">Counter-Proposal Wording</Label>
              <Textarea
                id="counterproposalWording"
                placeholder="Exact proposed language..."
                value={formData.counterproposalWording}
                onChange={e => setFormData(prev => ({ ...prev, counterproposalWording: e.target.value }))}
                rows={3}
                className="font-serif text-sm"
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
                onValueChange={(value: string) => setFormData(prev => ({ ...prev, owner: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {formOptions.owners.map(owner => (
                    <SelectItem key={owner} value={owner}>{owner}</SelectItem>
                  ))}
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
                onValueChange={(value: string) => setFormData(prev => ({ 
                  ...prev, 
                  impactCategory: value,
                  impactSubcategory: '' 
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {impactCategories.map(cat => (
                    <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Subcategory</Label>
              <Select
                value={formData.impactSubcategory}
                onValueChange={(value: string) => setFormData(prev => ({ ...prev, impactSubcategory: value }))}
                disabled={!formData.impactCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subcategory" />
                </SelectTrigger>
                <SelectContent>
                  {subcategories.map(sub => (
                    <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-[oklch(0.25_0.05_250)] hover:bg-[oklch(0.30_0.05_250)]"
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
    </Card>
  );
}
