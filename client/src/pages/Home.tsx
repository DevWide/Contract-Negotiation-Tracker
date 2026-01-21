// Contract Negotiation Tracker - Home Page
// Design: Refined Legal Elegance - Main application layout

import { useState, useCallback, useRef, useEffect } from 'react';
import { useNegotiation } from '@/contexts/NegotiationContext';
import { Header } from '@/components/Header';
import { ContractStatusBar } from '@/components/ContractStatusBar';
import { DashboardStats } from '@/components/DashboardStats';
import { FilterBar } from '@/components/FilterBar';
import { ClauseTable } from '@/components/ClauseTable';
import { ClauseForm } from '@/components/ClauseForm';
import { ComparisonModal } from '@/components/ComparisonModal';
import { ViewModal } from '@/components/ViewModal';
import { Timeline } from '@/components/Timeline';
import { PlaybookPanel } from '@/components/PlaybookPanel';
import { SettingsModal } from '@/components/SettingsModal';
import { ImportModal } from '@/components/ImportModal';
import { EmptyState } from '@/components/EmptyState';
import { TemplatesPage } from '@/components/TemplatesPage';
import { PlaybookModal } from '@/components/PlaybookModal';
import { SectionErrorBoundary } from '@/components/SectionErrorBoundary';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import type { ClauseItem, PaperSource } from '@/types';

export default function Home() {
  const { 
    activeContract, 
    createContract,
    setActiveContractId,
    deleteClauseItem,
    setEditingItemId,
  } = useNegotiation();

  // Modal states
  const [showSettings, setShowSettings] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showNewContractDialog, setShowNewContractDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Ref for the form area - used to scroll when editing
  const formAreaRef = useRef<HTMLDivElement>(null);
  
  // View/Edit states
  const [viewingItem, setViewingItem] = useState<ClauseItem | null>(null);
  const [editingItem, setEditingItem] = useState<ClauseItem | null>(null);
  const [comparingItem, setComparingItem] = useState<ClauseItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<ClauseItem | null>(null);
  const [playbookItem, setPlaybookItem] = useState<ClauseItem | null>(null);
  
  // Section collapse states
  const [showStats, setShowStats] = useState(true);
  const [showTimeline, setShowTimeline] = useState(true);
  const [showPlaybook, setShowPlaybook] = useState(false);

  // New contract form
  const [newContractForm, setNewContractForm] = useState({
    name: '',
    counterparty: '',
    description: '',
    paperSource: 'ours' as PaperSource,
  });

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onNew: () => {
      if (activeContract) {
        setShowAddForm(true);
      }
    },
    onEscape: () => {
      setShowAddForm(false);
      setViewingItem(null);
      setEditingItem(null);
      setComparingItem(null);
    },
  });

  const handleViewItem = useCallback((item: ClauseItem) => {
    setViewingItem(item);
  }, []);

  const handleEditItem = useCallback((item: ClauseItem) => {
    setEditingItem(item);
    setViewingItem(null);
  }, []);

  // Scroll to form when editing starts
  useEffect(() => {
    if (editingItem && formAreaRef.current) {
      formAreaRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [editingItem]);

  const handleCompareItem = useCallback((item: ClauseItem) => {
    setComparingItem(item);
    setViewingItem(null);
  }, []);

  const handleDeleteItem = useCallback((item: ClauseItem) => {
    setItemToDelete(item);
    setShowDeleteConfirm(true);
  }, []);

  const handleViewPlaybook = useCallback((item: ClauseItem) => {
    setPlaybookItem(item);
  }, []);

  const confirmDelete = useCallback(() => {
    if (activeContract && itemToDelete) {
      deleteClauseItem(activeContract.id, itemToDelete.id);
      setShowDeleteConfirm(false);
      setItemToDelete(null);
    }
  }, [activeContract, itemToDelete, deleteClauseItem]);

  const handleCreateContract = () => {
    if (!newContractForm.name.trim()) return;
    const newContract = createContract(newContractForm);
    setActiveContractId(newContract.id);
    setNewContractForm({ name: '', counterparty: '', description: '', paperSource: 'ours' });
    setShowNewContractDialog(false);
  };

  // Empty state when no contract selected
  if (!activeContract) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header 
        onOpenSettings={() => setShowSettings(true)} 
        onOpenTemplates={() => setShowTemplates(true)}
      />
        <EmptyState onCreateContract={() => setShowNewContractDialog(true)} />
        
        {/* Settings Modal */}
        <SettingsModal open={showSettings} onClose={() => setShowSettings(false)} />

        {/* Templates Page */}
        {showTemplates && (
          <div className="fixed inset-0 z-50 bg-background">
            <TemplatesPage onClose={() => setShowTemplates(false)} />
          </div>
        )}
        
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
                <Label htmlFor="name">Contract Name *</Label>
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
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewContractDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateContract}
                disabled={!newContractForm.name.trim()}
                className="bg-[oklch(0.45_0.08_160)] hover:bg-[oklch(0.50_0.08_160)]"
              >
                Create Contract
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header 
        onOpenSettings={() => setShowSettings(true)} 
        onOpenTemplates={() => setShowTemplates(true)}
      />
      <ContractStatusBar />

      <main className="flex-1 container py-6 space-y-6">
        {/* Dashboard Stats */}
        <section>
          <button 
            onClick={() => setShowStats(!showStats)}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-3"
          >
            {showStats ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            Dashboard
          </button>
          {showStats && (
            <SectionErrorBoundary sectionName="Dashboard">
              <DashboardStats />
            </SectionErrorBoundary>
          )}
        </section>

        {/* Timeline */}
        <section>
          <button 
            onClick={() => setShowTimeline(!showTimeline)}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-3"
          >
            {showTimeline ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            Timeline
          </button>
          {showTimeline && (
            <SectionErrorBoundary sectionName="Timeline">
              <Timeline />
            </SectionErrorBoundary>
          )}
        </section>

        {/* Clause Management */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-semibold">Clause Items</h2>
            <Button 
              onClick={() => setShowAddForm(true)}
              className="bg-[oklch(0.45_0.08_160)] hover:bg-[oklch(0.50_0.08_160)]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Clause
            </Button>
          </div>

          <FilterBar onImport={() => setShowImport(true)} />

          {/* Add/Edit Form */}
          <div ref={formAreaRef}>
            {(showAddForm || editingItem) && (
              <ClauseForm 
                editingItem={editingItem}
                onClose={() => {
                  setShowAddForm(false);
                  setEditingItem(null);
                }}
                onSaved={() => {
                  if (editingItem) {
                    setEditingItem(null);
                  }
                }}
              />
            )}
          </div>

          <SectionErrorBoundary sectionName="Clause Table">
            <ClauseTable 
              onViewItem={handleViewItem}
              onEditItem={handleEditItem}
              onCompareItem={handleCompareItem}
              onDeleteItem={handleDeleteItem}
              onViewPlaybook={handleViewPlaybook}
            />
          </SectionErrorBoundary>
        </section>

        {/* Playbook */}
        <section>
          <button 
            onClick={() => setShowPlaybook(!showPlaybook)}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-3"
          >
            {showPlaybook ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            Negotiation Playbook
          </button>
          {showPlaybook && (
            <SectionErrorBoundary sectionName="Playbook">
              <PlaybookPanel />
            </SectionErrorBoundary>
          )}
        </section>
      </main>

      {/* Modals */}
      <SettingsModal open={showSettings} onClose={() => setShowSettings(false)} />
      <ImportModal open={showImport} onClose={() => setShowImport(false)} />

      {viewingItem && (
        <ViewModal 
          item={viewingItem}
          open={!!viewingItem}
          onClose={() => setViewingItem(null)}
          onEdit={() => handleEditItem(viewingItem)}
          onCompare={() => handleCompareItem(viewingItem)}
        />
      )}

      {comparingItem && (
        <ComparisonModal 
          item={comparingItem}
          open={!!comparingItem}
          onClose={() => setComparingItem(null)}
        />
      )}

      {/* Templates Page */}
      {showTemplates && (
        <div className="fixed inset-0 z-50 bg-background">
          <TemplatesPage onClose={() => setShowTemplates(false)} />
        </div>
      )}

      {/* Playbook Modal */}
      {playbookItem && (
        <PlaybookModal
          item={playbookItem}
          open={!!playbookItem}
          onClose={() => setPlaybookItem(null)}
        />
      )}

      {/* Delete Confirmation */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Delete Clause?</DialogTitle>
            <DialogDescription>
              This will permanently delete the clause "{itemToDelete?.issue}". 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete Clause
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
