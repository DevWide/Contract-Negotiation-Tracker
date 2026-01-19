// Contract Negotiation Tracker - NewContractFromTemplateDialog
// Dialog for creating a new contract from an existing template

import { useState, useEffect } from 'react';
import { useNegotiation } from '@/contexts/NegotiationContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileText, Library } from 'lucide-react';
import type { Template } from '@/types';

interface NewContractFromTemplateDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function NewContractFromTemplateDialog({ 
  open, 
  onClose,
  onSuccess 
}: NewContractFromTemplateDialogProps) {
  const { templates, createContractFromTemplate, setActiveContractId } = useNegotiation();
  
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [contractName, setContractName] = useState('');
  const [counterparty, setCounterparty] = useState('');
  const [description, setDescription] = useState('');

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedTemplateId('');
      setContractName('');
      setCounterparty('');
      setDescription('');
    }
  }, [open]);

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  // Auto-fill description from template when selected
  useEffect(() => {
    if (selectedTemplate && !description) {
      setDescription(selectedTemplate.description);
    }
  }, [selectedTemplate]);

  const handleCreate = () => {
    if (!selectedTemplate || !contractName.trim()) return;

    const newContract = createContractFromTemplate({
      name: contractName.trim(),
      counterparty: counterparty.trim(),
      description: description.trim(),
      template: selectedTemplate,
    });

    if (newContract) {
      setActiveContractId(newContract.id);
      onSuccess?.();
      onClose();
    }
  };

  const canCreate = selectedTemplateId && contractName.trim();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl flex items-center gap-2">
            <Library className="w-5 h-5 text-[oklch(0.60_0.14_75)]" />
            New Contract from Template
          </DialogTitle>
          <DialogDescription>
            Create a new contract by loading clauses from an existing template. 
            This is ideal when the negotiation is on your paper.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Template Selection */}
          <div className="space-y-2">
            <Label htmlFor="template">Select Template *</Label>
            <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a template..." />
              </SelectTrigger>
              <SelectContent>
                {templates.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No templates available. Create a template first in Settings.
                  </div>
                ) : (
                  templates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <div className="flex flex-col">
                          <span>{template.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {template.clauses.length} clause{template.clauses.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {selectedTemplate && (
              <p className="text-xs text-muted-foreground mt-1">
                {selectedTemplate.description}
              </p>
            )}
          </div>

          {/* Contract Name */}
          <div className="space-y-2">
            <Label htmlFor="contractName">Contract Name *</Label>
            <Input
              id="contractName"
              placeholder="e.g., ABC Corp License Agreement"
              value={contractName}
              onChange={e => setContractName(e.target.value)}
            />
          </div>

          {/* Counterparty */}
          <div className="space-y-2">
            <Label htmlFor="counterparty">Counterparty</Label>
            <Input
              id="counterparty"
              placeholder="e.g., ABC Corporation"
              value={counterparty}
              onChange={e => setCounterparty(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of this contract..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Template Info */}
          {selectedTemplate && (
            <div className="bg-muted/50 rounded-lg p-3 border">
              <p className="text-sm font-medium mb-1">Template Preview</p>
              <p className="text-xs text-muted-foreground">
                This will create a new contract with {selectedTemplate.clauses.length} clause
                {selectedTemplate.clauses.length !== 1 ? 's' : ''} from "{selectedTemplate.name}".
                Paper source will be set to "Our Paper" and ball will be with them.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreate}
            disabled={!canCreate}
            className="bg-[oklch(0.25_0.05_250)] hover:bg-[oklch(0.30_0.05_250)]"
          >
            Create Contract
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
