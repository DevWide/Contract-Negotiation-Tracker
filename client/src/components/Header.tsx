// Contract Negotiation Tracker - Header Component
// Design: Organic Modern Professional - Deep sage with terracotta accents

import { useState } from 'react';
import { useNegotiation } from '@/contexts/NegotiationContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { NewContractFromTemplateDialog } from '@/components/NewContractFromTemplateDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  ChevronDown, 
  Plus, 
  FileText, 
  Settings, 
  Copy, 
  Archive,
  Trash2,
  Library,
  MoreVertical,
  CheckCircle
} from 'lucide-react';
import type { PaperSource } from '@/types';

interface NewContractForm {
  name: string;
  counterparty: string;
  description: string;
  paperSource: PaperSource;
  templateId?: string;
}

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenTemplates?: () => void;
}

export function Header({ onOpenSettings, onOpenTemplates }: HeaderProps) {
  const { 
    contracts, 
    activeContract, 
    setActiveContractId,
    createContract,
    createContractFromTemplate,
    duplicateContract,
    archiveContract,
    cna completeContract,
    deleteContract,
    templates,
  } = useNegotiation();
  
  const { markFeatureDiscovered } = useOnboarding();

  const [showNewContractDialog, setShowNewContractDialog] = useState(false);
  const [showFromTemplateDialog, setShowFromTemplateDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<number | null>(null);
  const [newContractForm, setNewContractForm] = useState<NewContractForm>({
    name: '',
    counterparty: '',
    description: '',
    paperSource: 'ours',
    templateId: undefined,
  });

  const activeContracts = contracts.filter(c => c.status === 'active');
  const archivedContracts = contracts.filter(c => c.status === 'archived');
  const completedContracts = contracts.filter(c => c.status === 'completed');

  const handleCreateContract = () => {
    if (!newContractForm.name.trim()) return;
    
    // If a template is selected and paper source is 'ours', create from template
    if (newContractForm.paperSource === 'ours' && newContractForm.templateId) {
      const selectedTemplate = templates.find(t => t.id === newContractForm.templateId);
      if (selectedTemplate) {
        createContractFromTemplate({
          name: newContractForm.name.trim(),
          counterparty: newContractForm.counterparty.trim(),
          description: newContractForm.description.trim(),
          template: selectedTemplate,
        });
        markFeatureDiscovered('use-template');
      }
    } else {
      createContract(newContractForm);
    }
    
    // Track feature discovery
    markFeatureDiscovered('create-contract');
    
    setNewContractForm({ name: '', counterparty: '', description: '', paperSource: 'ours', templateId: undefined });
    setShowNewContractDialog(false);
  };

  const handleDuplicate = () => {
    if (activeContract) {
      const newContract = duplicateContract(activeContract.id);
      if (newContract) {
        setActiveContractId(newContract.id);
      }
    }
  };

  const handleArchive = () => {
    if (activeContract) {
      archiveContract(activeContract.id);
    }
  };

  const handleComplete = () => {
    if (activeContract) {
      completeContract(activeContract.id);
    }
  };

  const handleDelete = () => {
    const idToDelete = contractToDelete ?? activeContract?.id;
    if (idToDelete) {
      deleteContract(idToDelete);
      setShowDeleteConfirm(false);
      setContractToDelete(null);
    }
  };

  const handleDeleteFromDropdown = (e: React.MouseEvent, contractId: number) => {
    e.stopPropagation();
    e.preventDefault();
    setContractToDelete(contractId);
    setShowDeleteConfirm(true);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-[oklch(0.28_0.06_160)] text-white shadow-lg">
        <div className="container flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#FAF9F5] flex items-center justify-center overflow-hidden">
              <img 
                src="/images/logo cnt.png" 
                alt="Contract Negotiation Tracker Logo" 
                className="w-8 h-8 object-contain"
              />
            </div>
            <div>
              <h1 className="text-lg font-serif font-semibold tracking-tight">
                Contract Negotiation Tracker
              </h1>
            </div>
          </div>

          {/* Contract Switcher */}
          <div className="flex items-center gap-3" data-tour="contract-switcher">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="min-w-[240px] justify-between bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
                >
                  <span className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 shrink-0" />
                    <span className="truncate">
                      {activeContract?.name || 'Select Contract'}
                    </span>
                  </span>
                  <ChevronDown className="w-4 h-4 shrink-0 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[280px]">
                <DropdownMenuItem onClick={() => setShowNewContractDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Contract
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowFromTemplateDialog(true)}>
                  <Library className="w-4 h-4 mr-2" />
                  From Template
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                
                {activeContracts.length > 0 && (
                  <>
                    <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                      Active Contracts
                    </div>
                    {activeContracts.map(contract => (
                      <DropdownMenuItem 
                        key={contract.id}
                        onClick={() => setActiveContractId(contract.id)}
                        className={`group ${activeContract?.id === contract.id ? 'bg-accent' : ''}`}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        <span className="truncate flex-1">{contract.name}</span>
                        <button
                          onClick={(e) => handleDeleteFromDropdown(e, contract.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 rounded transition-opacity"
                          title="Delete contract"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                        </button>
                      </DropdownMenuItem>
                    ))}
                  </>
                )}

                {completedContracts.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                      Completed
                    </div>
                    {completedContracts.map(contract => (
                      <DropdownMenuItem 
                        key={contract.id}
                        onClick={() => setActiveContractId(contract.id)}
                        className={`group ${activeContract?.id === contract.id ? 'bg-accent' : ''}`}
                      >
                        <FileText className="w-4 h-4 mr-2 opacity-50" />
                        <span className="truncate flex-1 text-muted-foreground">{contract.name}</span>
                        <button
                          onClick={(e) => handleDeleteFromDropdown(e, contract.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 rounded transition-opacity"
                          title="Delete contract"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                        </button>
                      </DropdownMenuItem>
                    ))}
                  </>
                )}

                {archivedContracts.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                      Archived
                    </div>
                    {archivedContracts.map(contract => (
                      <DropdownMenuItem 
                        key={contract.id}
                        onClick={() => setActiveContractId(contract.id)}
                        className={`group ${activeContract?.id === contract.id ? 'bg-accent' : ''}`}
                      >
                        <Archive className="w-4 h-4 mr-2 opacity-50" />
                        <span className="truncate flex-1 text-muted-foreground">{contract.name}</span>
                        <button
                          onClick={(e) => handleDeleteFromDropdown(e, contract.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 rounded transition-opacity"
                          title="Delete contract"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                        </button>
                      </DropdownMenuItem>
                    ))}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Contract Actions */}
            {activeContract && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-white/70 hover:text-white hover:bg-white/10"
                    title="Contract Actions"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleDuplicate}>
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate Contract
                  </DropdownMenuItem>
                  {activeContract && activeContract.status === 'active' && (
                    <DropdownMenuItem onClick={handleComplete}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark as Completed
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleArchive}>
                    <Archive className="w-4 h-4 mr-2" />
                    Archive Contract
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Contract
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Templates Library */}
            {onOpenTemplates && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={onOpenTemplates}
                className="text-white/70 hover:text-white hover:bg-white/10"
                title="Templates Library"
              >
                <Library className="w-5 h-5" />
              </Button>
            )}

            {/* Global Settings */}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onOpenSettings}
              className="text-white/70 hover:text-white hover:bg-white/10"
              title="Settings"
              data-tour="settings"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* New Contract Dialog */}
      <Dialog open={showNewContractDialog} onOpenChange={setShowNewContractDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Create New Contract</DialogTitle>
            <DialogDescription>
              Start a new contract negotiation. You can add clauses after creation.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Contract Name</Label>
              <Input
                id="name"
                placeholder="e.g., Acme Corp Software License"
                value={newContractForm.name}
                onChange={e => setNewContractForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="counterparty">Counterparty</Label>
              <Input
                id="counterparty"
                placeholder="e.g., Acme Corporation"
                value={newContractForm.counterparty}
                onChange={e => setNewContractForm(prev => ({ ...prev, counterparty: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the contract..."
                value={newContractForm.description}
                onChange={e => setNewContractForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="space-y-3">
              <Label>Paper Source</Label>
              <RadioGroup
                value={newContractForm.paperSource}
                onValueChange={(value: PaperSource) => 
                  setNewContractForm(prev => ({ ...prev, paperSource: value }))
                }
                className="grid grid-cols-2 gap-4"
              >
                <label 
                  className={`flex flex-col items-center gap-2 p-4 border rounded-lg cursor-pointer transition-all ${
                    newContractForm.paperSource === 'ours' 
                      ? 'border-[oklch(0.55_0.12_45)] bg-[oklch(0.93_0.05_45)]' 
                      : 'border-border hover:border-[oklch(0.55_0.12_45)]/50'
                  }`}
                >
                  <RadioGroupItem value="ours" className="sr-only" />
                  <span className="font-medium">Our Paper</span>
                  <span className="text-xs text-muted-foreground text-center">
                    We provided the template
                  </span>
                </label>
                <label 
                  className={`flex flex-col items-center gap-2 p-4 border rounded-lg cursor-pointer transition-all ${
                    newContractForm.paperSource === 'counterparty' 
                      ? 'border-[oklch(0.55_0.12_45)] bg-[oklch(0.93_0.05_45)]' 
                      : 'border-border hover:border-[oklch(0.55_0.12_45)]/50'
                  }`}
                >
                  <RadioGroupItem value="counterparty" className="sr-only" />
                  <span className="font-medium">Their Paper</span>
                  <span className="text-xs text-muted-foreground text-center">
                    Counterparty provided template
                  </span>
                </label>
              </RadioGroup>
            </div>
            
            {/* Template Selection - only shown when "Our Paper" is selected */}
            {newContractForm.paperSource === 'ours' && templates.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="template">Load from Template (Optional)</Label>
                <Select
                  value={newContractForm.templateId || 'none'}
                  onValueChange={(value) => 
                    setNewContractForm(prev => ({ 
                      ...prev, 
                      templateId: value === 'none' ? undefined : value 
                    }))
                  }
                >
                  <SelectTrigger id="template">
                    <SelectValue placeholder="Start with blank contract" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No template (blank contract)</SelectItem>
                    {templates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name} ({template.clauses.length} clauses)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Select a template to pre-populate the contract with its clauses
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewContractDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateContract}
              disabled={!newContractForm.name.trim()}
              className="bg-primary hover:bg-primary/90"
            >
              Create Contract
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={(open) => {
        setShowDeleteConfirm(open);
        if (!open) setContractToDelete(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Delete Contract?</DialogTitle>
            <DialogDescription>
              This will permanently delete "{
                contractToDelete 
                  ? contracts.find(c => c.id === contractToDelete)?.name 
                  : activeContract?.name
              }" and all its clauses. 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowDeleteConfirm(false);
              setContractToDelete(null);
            }}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Contract
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Contract from Template Dialog */}
      <NewContractFromTemplateDialog
        open={showFromTemplateDialog}
        onClose={() => setShowFromTemplateDialog(false)}
      />
    </>
  );
}
