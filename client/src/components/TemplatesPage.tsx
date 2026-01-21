// Contract Negotiation Tracker - TemplatesPage Component
// Design: Refined Legal Elegance - Full template management with expanded columns and Track Changes view

import { useState, useRef, useCallback } from 'react';
import { useNegotiation } from '@/contexts/NegotiationContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Plus, 
  FileText, 
  ChevronDown, 
  Pencil, 
  Copy, 
  Trash2,
  Upload,
  X,
  ArrowLeft,
  GitCompare,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Check,
  Loader2
} from 'lucide-react';
import { parseFile, type ParsedClause, type ParsedDocument } from '@/lib/docxParser';
import type { Template, TemplateClause } from '@/types';
import { computeDiff } from '@/lib/textDiff';

interface TemplatesPageProps {
  onClose: () => void;
}

// Status options for template clauses
const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'bg-gray-100 text-gray-700' },
  { value: 'in_review', label: 'In Review', color: 'bg-blue-100 text-blue-700' },
  { value: 'approved', label: 'Approved', color: 'bg-green-100 text-green-700' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-700' },
];

// Extended clause interface for import with selection
interface ImportableClause extends ParsedClause {
  id: string;
  selected: boolean;
}

type NewTemplateTab = 'manual' | 'import';
type ImportStep = 'upload' | 'preview' | 'success';

export function TemplatesPage({ onClose }: TemplatesPageProps) {
  const {
    templates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    addClauseToTemplate,
    updateTemplateClause,
    deleteTemplateClause,
    impactCategories,
  } = useNegotiation();

  const [expandedTemplates, setExpandedTemplates] = useState<string[]>([]);
  const [showNewTemplateDialog, setShowNewTemplateDialog] = useState(false);
  const [showEditTemplateDialog, setShowEditTemplateDialog] = useState(false);
  const [showClauseDialog, setShowClauseDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showTrackChanges, setShowTrackChanges] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [selectedClause, setSelectedClause] = useState<TemplateClause | null>(null);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [trackChangesClause, setTrackChangesClause] = useState<TemplateClause | null>(null);
  const [trackChangesIndex, setTrackChangesIndex] = useState(0);
  const [trackChangesClauses, setTrackChangesClauses] = useState<TemplateClause[]>([]);

  // New Template Dialog states
  const [newTemplateTab, setNewTemplateTab] = useState<NewTemplateTab>('manual');
  const [importStep, setImportStep] = useState<ImportStep>('upload');
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importedClauses, setImportedClauses] = useState<ImportableClause[]>([]);
  const [expandedImportClause, setExpandedImportClause] = useState<string>('');
  const [parsedDocument, setParsedDocument] = useState<ParsedDocument | null>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [templateName, setTemplateName] = useState('');
  const [templateDesc, setTemplateDesc] = useState('');
  const [clauseNumber, setClauseNumber] = useState('');
  const [clauseBaselineText, setClauseBaselineText] = useState('');
  const [clauseIssue, setClauseIssue] = useState('');
  const [clauseRationale, setClauseRationale] = useState('');
  const [clauseTheirPosition, setClauseTheirPosition] = useState('');
  const [clauseOurPosition, setClauseOurPosition] = useState('');
  const [clauseCategory, setClauseCategory] = useState('');
  const [clauseSubcategory, setClauseSubcategory] = useState('');
  const [clauseStatus, setClauseStatus] = useState('pending');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleTemplateExpanded = (templateId: string) => {
    setExpandedTemplates(prev =>
      prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  // Reset import dialog state
  const resetImportState = useCallback(() => {
    setNewTemplateTab('manual');
    setImportStep('upload');
    setImportLoading(false);
    setImportError(null);
    setImportedClauses([]);
    setExpandedImportClause('');
    setParsedDocument(null);
    setTemplateName('');
    setTemplateDesc('');
  }, []);

  // Handle new template dialog close
  const handleNewTemplateDialogChange = (open: boolean) => {
    if (!open) {
      resetImportState();
    }
    setShowNewTemplateDialog(open);
  };

  // Handle document file selection for import
  const handleDocumentSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportLoading(true);
    setImportError(null);

    try {
      const result = await parseFile(file);
      
      if (result.clauses.length === 0) {
        throw new Error('No clauses found in the document. Please check that the document has numbered sections.');
      }

      setTemplateName(result.title || file.name.replace(/\.[^/.]+$/, ''));
      setTemplateDesc(`Imported from ${file.name}`);
      setParsedDocument(result);
      setImportedClauses(result.clauses.map((clause, index) => ({
        ...clause,
        id: `imported-${index}`,
        selected: true,
      })));
      setImportStep('preview');
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Failed to parse file');
    } finally {
      setImportLoading(false);
      if (documentInputRef.current) {
        documentInputRef.current.value = '';
      }
    }
  };

  // Handle clause editing in import preview
  const handleImportClauseChange = (id: string, field: keyof ParsedClause, value: string | number) => {
    setImportedClauses(prev => prev.map(c =>
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  // Toggle clause selection
  const handleToggleImportClause = (id: string) => {
    setImportedClauses(prev => prev.map(c =>
      c.id === id ? { ...c, selected: !c.selected } : c
    ));
  };

  // Remove clause from import
  const handleRemoveImportClause = (id: string) => {
    setImportedClauses(prev => prev.filter(c => c.id !== id));
  };

  // Select/deselect all clauses
  const handleSelectAllImportClauses = (selected: boolean) => {
    setImportedClauses(prev => prev.map(c => ({ ...c, selected })));
  };

  // Create template from imported clauses
  const handleImportTemplate = () => {
    const selectedClauses = importedClauses.filter(c => c.selected);
    
    if (selectedClauses.length === 0) {
      setImportError('Please select at least one clause to import');
      return;
    }

    const template = createTemplate({
      name: templateName.trim() || 'Imported Template',
      description: templateDesc.trim(),
    });

    selectedClauses.forEach(clause => {
      addClauseToTemplate(template.id, {
        clauseNumber: clause.clauseNumber,
        topic: clause.topic, // Subclause title (e.g., "Affiliate", "Fees")
        baselineText: clause.clauseText, // Map parsed clauseText to baselineText
        theirPosition: '', // Start empty
        ourPosition: '', // Start empty
        issue: clause.topic, // Use topic as issue for display
        rationale: '',
        impactCategory: clause.issue, // Section category (e.g., "Definitions", "Fees and Payment")
        impactSubcategory: '',
      });
    });

    // Expand the newly created template
    setExpandedTemplates(prev => [...prev, template.id]);

    setImportStep('success');
    setTimeout(() => {
      handleNewTemplateDialogChange(false);
    }, 1500);
  };

  // Get count of selected clauses
  const selectedImportCount = importedClauses.filter(c => c.selected).length;

  // Get count of low-confidence clauses
  const lowConfidenceCount = importedClauses.filter(c => c.confidence < 70).length;

  const handleCreateTemplate = () => {
    if (!templateName.trim()) return;
    createTemplate({
      name: templateName.trim(),
      description: templateDesc.trim(),
    });
    setTemplateName('');
    setTemplateDesc('');
    setShowNewTemplateDialog(false);
  };

  const handleEditTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setTemplateName(template.name);
    setTemplateDesc(template.description);
    setShowEditTemplateDialog(true);
  };

  const handleUpdateTemplate = () => {
    if (!selectedTemplate || !templateName.trim()) return;
    updateTemplate(selectedTemplate.id, {
      name: templateName.trim(),
      description: templateDesc.trim(),
    });
    setTemplateName('');
    setTemplateDesc('');
    setSelectedTemplate(null);
    setShowEditTemplateDialog(false);
  };

  const handleDeleteTemplate = () => {
    if (!templateToDelete) return;
    deleteTemplate(templateToDelete);
    setTemplateToDelete(null);
    setShowDeleteConfirm(false);
  };

  const handleDuplicateTemplate = (templateId: string) => {
    duplicateTemplate(templateId);
  };

  const resetClauseForm = () => {
    setClauseNumber('');
    setClauseBaselineText('');
    setClauseIssue('');
    setClauseRationale('');
    setClauseTheirPosition('');
    setClauseOurPosition('');
    setClauseCategory('');
    setClauseSubcategory('');
    setClauseStatus('pending');
  };

  const handleAddClause = (template: Template) => {
    setSelectedTemplate(template);
    setSelectedClause(null);
    resetClauseForm();
    setShowClauseDialog(true);
  };

  const handleEditClause = (template: Template, clause: TemplateClause) => {
    setSelectedTemplate(template);
    setSelectedClause(clause);
    setClauseNumber(clause.clauseNumber);
    setClauseBaselineText(clause.baselineText);
    setClauseIssue(clause.issue);
    setClauseRationale(clause.rationale);
    setClauseTheirPosition(clause.theirPosition);
    setClauseOurPosition(clause.ourPosition);
    setClauseCategory(clause.impactCategory);
    setClauseSubcategory(clause.impactSubcategory);
    setClauseStatus((clause as any).status || 'pending');
    setShowClauseDialog(true);
  };

  const handleSaveClause = () => {
    if (!selectedTemplate || !clauseNumber.trim() || !clauseIssue.trim()) return;

    const clauseData = {
      clauseNumber: clauseNumber.trim(),
      baselineText: clauseBaselineText.trim(),
      theirPosition: clauseTheirPosition.trim(),
      ourPosition: clauseOurPosition.trim(),
      issue: clauseIssue.trim(),
      rationale: clauseRationale.trim(),
      impactCategory: clauseCategory,
      impactSubcategory: clauseSubcategory,
      status: clauseStatus,
    };

    if (selectedClause) {
      updateTemplateClause(selectedTemplate.id, selectedClause.id, clauseData);
    } else {
      addClauseToTemplate(selectedTemplate.id, clauseData);
    }

    resetClauseForm();
    setSelectedTemplate(null);
    setSelectedClause(null);
    setShowClauseDialog(false);
  };

  const handleDeleteClause = (templateId: string, clauseId: string) => {
    deleteTemplateClause(templateId, clauseId);
  };

  const handleOpenTrackChanges = (template: Template, clause: TemplateClause) => {
    // Filter clauses that have both baseline and our position text
    const clausesWithChanges = template.clauses.filter(
      c => c.baselineText && c.ourPosition
    );
    const index = clausesWithChanges.findIndex(c => c.id === clause.id);
    
    setTrackChangesClauses(clausesWithChanges);
    setTrackChangesIndex(index >= 0 ? index : 0);
    setTrackChangesClause(clausesWithChanges[index >= 0 ? index : 0] || clause);
    setShowTrackChanges(true);
  };

  const navigateTrackChanges = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' 
      ? Math.max(0, trackChangesIndex - 1)
      : Math.min(trackChangesClauses.length - 1, trackChangesIndex + 1);
    setTrackChangesIndex(newIndex);
    setTrackChangesClause(trackChangesClauses[newIndex]);
  };

  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) return;

      // Parse header
      const header = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
      const clauseNumIdx = header.findIndex(h => h.includes('clause') && h.includes('#') || h === 'clausenumber');
      const topicIdx = header.findIndex(h => h.includes('topic') || h.includes('issue'));
      const textIdx = header.findIndex(h => h.includes('text') || h.includes('clause text') || h.includes('baseline'));
      const rationaleIdx = header.findIndex(h => h.includes('rationale'));
      const theirPosIdx = header.findIndex(h => h.includes('their') && h.includes('position'));
      const ourPosIdx = header.findIndex(h => h.includes('our') && h.includes('position'));

      // Create new template from CSV
      const clauses: Omit<TemplateClause, 'id'>[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
        if (values.length < 2) continue;

        clauses.push({
          clauseNumber: clauseNumIdx >= 0 ? values[clauseNumIdx] : `${i}`,
          topic: topicIdx >= 0 ? values[topicIdx] : values[1] || '',
          baselineText: textIdx >= 0 ? values[textIdx] : '',
          theirPosition: theirPosIdx >= 0 ? values[theirPosIdx] : '',
          ourPosition: ourPosIdx >= 0 ? values[ourPosIdx] : '',
          issue: topicIdx >= 0 ? values[topicIdx] : values[1] || '',
          rationale: rationaleIdx >= 0 ? values[rationaleIdx] : '',
          impactCategory: '',
          impactSubcategory: '',
        });
      }

      if (clauses.length > 0) {
        const template = createTemplate({
          name: file.name.replace(/\.csv$/i, ''),
          description: `Imported from ${file.name}`,
        });
        
        clauses.forEach(clause => {
          addClauseToTemplate(template.id, clause);
        });

        // Expand the newly created template
        setExpandedTemplates(prev => [...prev, template.id]);
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getSubcategories = (categoryName: string) => {
    const category = impactCategories.find(c => c.name === categoryName);
    return category?.subcategories || [];
  };

  const getStatusBadge = (status: string) => {
    const statusOption = STATUS_OPTIONS.find(s => s.value === status);
    return statusOption || STATUS_OPTIONS[0];
  };

  // Compute diff statistics
  const computeDiffStats = (original: string, proposed: string) => {
    if (!original || !proposed) return { added: 0, deleted: 0, similarity: 0 };
    
    const diff = computeDiff(original, proposed);
    let added = 0;
    let deleted = 0;
    let unchanged = 0;
    
    diff.forEach(word => {
      if (word.type === 'added') added++;
      else if (word.type === 'removed') deleted++;
      else unchanged++;
    });
    
    const total = added + deleted + unchanged;
    const similarity = total > 0 ? Math.round((unchanged / total) * 100) : 100;
    
    return { added, deleted, similarity };
  };

  // Render diff with highlighting
  const renderDiffText = (original: string, proposed: string, showOriginal: boolean) => {
    if (!original || !proposed) {
      return <span className="text-muted-foreground italic">No text available</span>;
    }
    
    const diff = computeDiff(original, proposed);
    
    if (showOriginal) {
      return diff.map((word, i) => {
        if (word.type === 'added') return null;
        return (
          <span
            key={i}
            className={word.type === 'removed' ? 'bg-red-100 text-red-800 line-through' : ''}
          >
            {word.text}{' '}
          </span>
        );
      });
    } else {
      return diff.map((word, i) => {
        if (word.type === 'removed') return null;
        return (
          <span
            key={i}
            className={word.type === 'added' ? 'bg-green-100 text-green-800' : ''}
          >
            {word.text}{' '}
          </span>
        );
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={onClose}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-serif font-semibold">Templates Library</h1>
                <p className="text-sm text-muted-foreground">
                  Create templates to quickly set up new contracts with predefined clauses
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleImportCSV}
                className="hidden"
              />
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4 mr-2" />
                Import CSV
              </Button>
              <Button onClick={() => setShowNewTemplateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Template
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* CSV Format Info */}
      <div className="container py-4">
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
          <p className="text-sm">
            <span className="font-semibold text-primary">CSV Format:</span>{' '}
            Your CSV should have columns for{' '}
            <code className="bg-primary/10 px-1.5 py-0.5 rounded text-primary">Clause #</code>,{' '}
            <code className="bg-primary/10 px-1.5 py-0.5 rounded text-primary">Topic</code>,{' '}
            <code className="bg-primary/10 px-1.5 py-0.5 rounded text-primary">Clause Text</code>,{' '}
            <code className="bg-primary/10 px-1.5 py-0.5 rounded text-primary">Rationale</code>,{' '}
            <code className="bg-primary/10 px-1.5 py-0.5 rounded text-primary">Counter Proposal</code>, and{' '}
            <code className="bg-primary/10 px-1.5 py-0.5 rounded text-primary">Counter Wording</code>.{' '}
            Headers are auto-detected, or columns are mapped by position.
          </p>
        </div>

        {/* Templates List */}
        <div className="space-y-4">
          {templates.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-card">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">No templates yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create a template to get started, or import from CSV
              </p>
              <Button onClick={() => setShowNewTemplateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </div>
          ) : (
            templates.map(template => (
              <Collapsible
                key={template.id}
                open={expandedTemplates.includes(template.id)}
                onOpenChange={() => toggleTemplateExpanded(template.id)}
              >
                <div className="border rounded-lg bg-card overflow-hidden">
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <ChevronDown 
                          className={`w-5 h-5 text-muted-foreground transition-transform ${
                            expandedTemplates.includes(template.id) ? '' : '-rotate-90'
                          }`} 
                        />
                        <FileText className="w-5 h-5 text-primary" />
                        <div>
                          <h3 className="font-medium">{template.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {template.clauses.length} clauses
                            {template.description && ` • ${template.description}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditTemplate(template)}
                          className="h-8 w-8"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDuplicateTemplate(template.id)}
                          className="h-8 w-8"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setTemplateToDelete(template.id);
                            setShowDeleteConfirm(true);
                          }}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="border-t bg-muted/30 p-4">
                      {/* Expanded Clauses Table with All Columns */}
                      {template.clauses.length > 0 ? (
                        <div className="border rounded-lg bg-background overflow-x-auto mb-4 max-h-[500px] overflow-y-auto">
                          <div className="min-w-[1400px]">
                              <table className="w-full">
                                <thead>
                                  <tr className="border-b bg-muted/50">
                                    <th className="text-left p-3 text-xs font-semibold uppercase tracking-wider w-20">Clause #</th>
                                    <th className="text-left p-3 text-xs font-semibold uppercase tracking-wider w-32">Topic</th>
                                    <th className="text-left p-3 text-xs font-semibold uppercase tracking-wider w-64">Baseline Text</th>
                                    <th className="text-left p-3 text-xs font-semibold uppercase tracking-wider w-48">Issue & Rationale</th>
                                    <th className="text-left p-3 text-xs font-semibold uppercase tracking-wider w-40">Their Position</th>
                                    <th className="text-left p-3 text-xs font-semibold uppercase tracking-wider w-64">Our Position</th>
                                    <th className="text-left p-3 text-xs font-semibold uppercase tracking-wider w-28">
                                      <div className="flex items-center gap-1">
                                        Impact
                                        <span className="text-muted-foreground">↕</span>
                                      </div>
                                    </th>
                                    <th className="text-left p-3 text-xs font-semibold uppercase tracking-wider w-24">
                                      <div className="flex items-center gap-1">
                                        Status
                                        <span className="text-muted-foreground">↕</span>
                                      </div>
                                    </th>
                                    <th className="text-right p-3 text-xs font-semibold uppercase tracking-wider w-24">Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {template.clauses.map(clause => {
                                    const status = getStatusBadge((clause as any).status || 'pending');
                                    const hasChanges = clause.baselineText && clause.ourPosition;
                                    
                                    return (
                                      <tr key={clause.id} className="border-b last:border-0 hover:bg-muted/30 align-top">
                                        <td className="p-3 font-mono text-sm font-medium">{clause.clauseNumber}</td>
                                        <td className="p-3 text-sm font-medium">{clause.issue}</td>
                                        <td className="p-3 text-sm text-muted-foreground">
                                          <div className="line-clamp-3">
                                            {clause.baselineText || <span className="italic">No text</span>}
                                          </div>
                                        </td>
                                        <td className="p-3 text-sm text-muted-foreground">
                                          <div className="line-clamp-3">
                                            {clause.rationale || <span className="italic">—</span>}
                                          </div>
                                        </td>
                                        <td className="p-3 text-sm">
                                          <div className="line-clamp-2">
                                            {clause.theirPosition || <span className="italic text-muted-foreground">—</span>}
                                          </div>
                                        </td>
                                        <td className="p-3 text-sm text-muted-foreground">
                                          <div className="line-clamp-3">
                                            {clause.ourPosition || <span className="italic">—</span>}
                                          </div>
                                        </td>
                                        <td className="p-3 text-sm">
                                          {clause.impactCategory ? (
                                            <div>
                                              <div className="font-medium">{clause.impactCategory}</div>
                                              {clause.impactSubcategory && (
                                                <div className="text-xs text-muted-foreground">{clause.impactSubcategory}</div>
                                              )}
                                            </div>
                                          ) : (
                                            <span className="italic text-muted-foreground">—</span>
                                          )}
                                        </td>
                                        <td className="p-3">
                                          <Badge className={`${status.color} text-xs`}>
                                            {status.label}
                                          </Badge>
                                        </td>
                                        <td className="p-3 text-right">
                                          <div className="flex items-center justify-end gap-1">
                                            {hasChanges && (
                                              <Tooltip>
                                                <TooltipTrigger asChild>
                                                  <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleOpenTrackChanges(template, clause)}
                                                    className="h-7 w-7 text-primary"
                                                  >
                                                    <GitCompare className="w-3.5 h-3.5" />
                                                  </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Track Changes</TooltipContent>
                                              </Tooltip>
                                            )}
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              onClick={() => handleEditClause(template, clause)}
                                              className="h-7 w-7"
                                            >
                                              <Pencil className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              onClick={() => handleDeleteClause(template.id, clause.id)}
                                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                            >
                                              <X className="w-3.5 h-3.5" />
                                            </Button>
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                        </div>
                      ) : (
                        <div className="text-center py-6 border rounded-lg bg-background mb-4">
                          <p className="text-sm text-muted-foreground">
                            No clauses in this template yet
                          </p>
                        </div>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddClause(template)}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Clause
                      </Button>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-sm text-muted-foreground">
          {templates.length} templates • {impactCategories.length} impact categories
        </div>
      </div>

      {/* New Template Dialog - Enhanced with Import from Document */}
      <Dialog open={showNewTemplateDialog} onOpenChange={handleNewTemplateDialogChange}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-serif">Create New Template</DialogTitle>
            <DialogDescription>
              Create a template manually or import from an existing contract document
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={newTemplateTab} onValueChange={(v) => setNewTemplateTab(v as NewTemplateTab)} className="flex-1 flex flex-col min-h-0">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual" className="flex items-center gap-2">
                <Pencil className="w-4 h-4" />
                Manual Entry
              </TabsTrigger>
              <TabsTrigger value="import" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Import from Document
              </TabsTrigger>
            </TabsList>
            
            {/* Manual Entry Tab */}
            <TabsContent value="manual" className="flex-1 space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="template-name">Template Name *</Label>
                <Input
                  id="template-name"
                  placeholder="e.g., SaaS Agreement Template"
                  value={templateName}
                  onChange={e => setTemplateName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="template-desc">Description</Label>
                <Textarea
                  id="template-desc"
                  placeholder="Brief description of when to use this template..."
                  value={templateDesc}
                  onChange={e => setTemplateDesc(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <Button variant="outline" onClick={() => handleNewTemplateDialogChange(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTemplate} disabled={!templateName.trim()}>
                  Create Template
                </Button>
              </div>
            </TabsContent>
            
            {/* Import from Document Tab */}
            <TabsContent value="import" className="flex-1 flex flex-col min-h-0 mt-4">
              {importStep === 'upload' && (
                <div className="flex-1 flex flex-col">
                  <div className="space-y-4 mb-4">
                    <div className="space-y-2">
                      <Label htmlFor="import-template-name">Template Name *</Label>
                      <Input
                        id="import-template-name"
                        placeholder="e.g., SaaS Agreement Template"
                        value={templateName}
                        onChange={e => setTemplateName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="import-template-desc">Description</Label>
                      <Textarea
                        id="import-template-desc"
                        placeholder="Brief description of when to use this template..."
                        value={templateDesc}
                        onChange={e => setTemplateDesc(e.target.value)}
                        rows={2}
                      />
                    </div>
                  </div>
                  
                  <div 
                    className="flex-1 border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[200px]"
                    onClick={() => documentInputRef.current?.click()}
                  >
                    {importLoading ? (
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-12 h-12 text-muted-foreground animate-spin" />
                        <p className="text-muted-foreground">Analyzing document...</p>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-lg font-medium mb-2">
                          Upload a contract document
                        </p>
                        <p className="text-sm text-muted-foreground mb-4">
                          PDF, DOCX, or TXT files supported
                        </p>
                        <p className="text-xs text-muted-foreground">
                          We'll automatically detect clauses and sections
                        </p>
                      </>
                    )}
                    <input
                      ref={documentInputRef}
                      type="file"
                      accept=".pdf,.docx,.txt"
                      onChange={handleDocumentSelect}
                      className="hidden"
                    />
                  </div>

                  {importError && (
                    <Alert variant="destructive" className="mt-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{importError}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="pt-4 flex justify-end">
                    <Button variant="outline" onClick={() => handleNewTemplateDialogChange(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {importStep === 'preview' && (
                <div className="flex-1 flex flex-col min-h-0 space-y-4">
                  {/* Template Name & Description */}
                  <div className="grid gap-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="preview-name">Template Name</Label>
                        <Input
                          id="preview-name"
                          value={templateName}
                          onChange={e => setTemplateName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="preview-desc">Description</Label>
                        <Input
                          id="preview-desc"
                          value={templateDesc}
                          onChange={e => setTemplateDesc(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Extraction Summary */}
                  {parsedDocument && (
                    <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Extraction Summary</span>
                        <Badge variant={parsedDocument.overallConfidence >= 80 ? 'default' : parsedDocument.overallConfidence >= 60 ? 'secondary' : 'destructive'}>
                          {parsedDocument.overallConfidence}% confidence
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {importedClauses.length} clauses detected • {selectedImportCount} selected
                        {lowConfidenceCount > 0 && (
                          <span className="text-amber-600 ml-2">
                            • {lowConfidenceCount} may need review
                          </span>
                        )}
                      </div>
                      {parsedDocument.warnings && parsedDocument.warnings.length > 0 && (
                        <div className="text-xs text-amber-600">
                          {parsedDocument.warnings.join(' • ')}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Clauses Table */}
                  <div className="space-y-2 flex-1 min-h-0">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">
                        Template Clauses ({selectedImportCount})
                      </Label>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleSelectAllImportClauses(true)}>
                          Select All
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleSelectAllImportClauses(false)}>
                          Deselect All
                        </Button>
                      </div>
                    </div>

                    {importError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{importError}</AlertDescription>
                      </Alert>
                    )}

                    <ScrollArea className="h-[280px] border rounded-lg">
                      <Accordion
                        type="single"
                        collapsible
                        value={expandedImportClause}
                        onValueChange={setExpandedImportClause}
                        className="px-1"
                      >
                        {importedClauses.map((clause) => (
                          <AccordionItem 
                            key={clause.id} 
                            value={clause.id} 
                            className={`border-b last:border-b-0 ${!clause.selected ? 'opacity-50' : ''}`}
                          >
                            <AccordionTrigger className="hover:no-underline py-3 px-2">
                              <div className="flex items-center gap-3 text-left w-full">
                                <Checkbox
                                  checked={clause.selected}
                                  onCheckedChange={() => handleToggleImportClause(clause.id)}
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <span className={`w-12 h-8 rounded flex items-center justify-center text-xs font-medium shrink-0 ${
                                  clause.confidence >= 80 ? 'bg-muted' : 
                                  clause.confidence >= 60 ? 'bg-amber-100 text-amber-700' : 
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {clause.clauseNumber}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">
                                    {clause.topic}
                                  </p>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {clause.clauseText.slice(0, 80)}...
                                  </p>
                                </div>
                                {clause.confidence < 70 && (
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <AlertCircle className="w-4 h-4 text-amber-500" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      {clause.warnings?.join(', ') || 'Low confidence - review recommended'}
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-2 pb-4">
                              <div className="space-y-3 ml-7">
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-1.5">
                                    <Label className="text-xs">Clause #</Label>
                                    <Input
                                      value={clause.clauseNumber}
                                      onChange={e => handleImportClauseChange(clause.id, 'clauseNumber', e.target.value)}
                                      className="h-8"
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <Label className="text-xs">Topic</Label>
                                    <Input
                                      value={clause.topic}
                                      onChange={e => handleImportClauseChange(clause.id, 'topic', e.target.value)}
                                      className="h-8"
                                    />
                                  </div>
                                </div>
                                <div className="space-y-1.5">
                                  <Label className="text-xs">Original Text</Label>
                                  <Textarea
                                    value={clause.clauseText}
                                    onChange={e => handleImportClauseChange(clause.id, 'clauseText', e.target.value)}
                                    rows={4}
                                    className="text-sm"
                                  />
                                </div>
                                <div className="flex justify-end">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveImportClause(clause.id)}
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  >
                                    <Trash2 className="w-4 h-4 mr-1" />
                                    Remove Clause
                                  </Button>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </ScrollArea>
                  </div>

                  <div className="pt-2 flex justify-between">
                    <Button variant="outline" onClick={() => setImportStep('upload')}>
                      ← Back
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => handleNewTemplateDialogChange(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleImportTemplate}
                        disabled={selectedImportCount === 0}
                      >
                        Create Template ({selectedImportCount} clauses)
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {importStep === 'success' && (
                <div className="flex-1 flex items-center justify-center py-12">
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                      <Check className="w-8 h-8 text-green-600" />
                    </div>
                    <p className="text-lg font-medium">Template Created Successfully!</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedImportCount} clauses imported into "{templateName}"
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Edit Template Dialog */}
      <Dialog open={showEditTemplateDialog} onOpenChange={setShowEditTemplateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Edit Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Template Name</Label>
              <Input
                value={templateName}
                onChange={e => setTemplateName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={templateDesc}
                onChange={e => setTemplateDesc(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditTemplateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateTemplate} disabled={!templateName.trim()}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Clause Dialog */}
      <Dialog open={showClauseDialog} onOpenChange={setShowClauseDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif">
              {selectedClause ? 'Edit Clause' : 'Add Clause'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Clause Number</Label>
                <Input
                  placeholder="e.g., 5.1"
                  value={clauseNumber}
                  onChange={e => setClauseNumber(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Topic/Issue *</Label>
                <Input
                  placeholder="e.g., Warranty Period"
                  value={clauseIssue}
                  onChange={e => setClauseIssue(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Baseline Text</Label>
              <Textarea
                placeholder="Original/baseline clause text..."
                value={clauseBaselineText}
                onChange={e => setClauseBaselineText(e.target.value)}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Issue & Rationale</Label>
              <Textarea
                placeholder="Why this clause matters and the key issue..."
                value={clauseRationale}
                onChange={e => setClauseRationale(e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Their Position</Label>
              <Textarea
                placeholder="Expected counterparty position..."
                value={clauseTheirPosition}
                onChange={e => setClauseTheirPosition(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Our Position</Label>
              <Textarea
                placeholder="Our standard counter-position..."
                value={clauseOurPosition}
                onChange={e => setClauseOurPosition(e.target.value)}
                rows={4}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Impact Category</Label>
                <Select value={clauseCategory} onValueChange={val => {
                  setClauseCategory(val);
                  setClauseSubcategory('');
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {impactCategories.map(cat => (
                      <SelectItem key={cat.name} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subcategory</Label>
                <Select 
                  value={clauseSubcategory} 
                  onValueChange={setClauseSubcategory}
                  disabled={!clauseCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {getSubcategories(clauseCategory).map(sub => (
                      <SelectItem key={sub} value={sub}>
                        {sub}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={clauseStatus} onValueChange={setClauseStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(status => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClauseDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveClause} 
              disabled={!clauseNumber.trim() || !clauseIssue.trim()}
            >
              {selectedClause ? 'Save Changes' : 'Add Clause'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Track Changes Modal */}
      <Dialog open={showTrackChanges} onOpenChange={setShowTrackChanges}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-primary" />
                <div>
                  <DialogTitle className="font-serif text-xl">Track Changes</DialogTitle>
                  <p className="text-sm text-muted-foreground">
                    Clause {trackChangesClause?.clauseNumber}
                  </p>
                </div>
              </div>
              {trackChangesClauses.length > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigateTrackChanges('prev')}
                    disabled={trackChangesIndex === 0}
                    className="h-8 w-8"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground min-w-[60px] text-center">
                    {trackChangesIndex + 1} / {trackChangesClauses.length}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigateTrackChanges('next')}
                    disabled={trackChangesIndex === trackChangesClauses.length - 1}
                    className="h-8 w-8"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8 ml-2">
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </DialogHeader>
          
          {trackChangesClause && (
            <div className="py-4">
              {/* Diff Statistics */}
              {(() => {
                const stats = computeDiffStats(
                  trackChangesClause.baselineText,
                  trackChangesClause.ourPosition
                );
                return (
                  <div className="flex items-center gap-4 mb-6">
                    <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                      + {stats.added} added
                    </Badge>
                    <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">
                      − {stats.deleted} deleted
                    </Badge>
                    <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
                      ↗ +{stats.added - stats.deleted} net
                    </Badge>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${stats.similarity}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">{stats.similarity}% similar</span>
                    </div>
                  </div>
                );
              })()}

              {/* Legend */}
              <div className="flex items-center gap-4 mb-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-100 border border-red-200 rounded" />
                  <span className="text-muted-foreground">Deleted</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 border border-green-200 rounded" />
                  <span className="text-muted-foreground">Added</span>
                </div>
              </div>

              {/* Side-by-side comparison */}
              <div className="grid grid-cols-2 gap-4">
                {/* Original */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <span className="text-sm font-semibold uppercase tracking-wider">Original</span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 text-xs">
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 min-h-[200px] text-sm leading-relaxed border">
                    {renderDiffText(
                      trackChangesClause.baselineText,
                      trackChangesClause.ourPosition,
                      true
                    )}
                  </div>
                </div>

                {/* Proposed */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-sm font-semibold uppercase tracking-wider">Our Position</span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 text-xs">
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 min-h-[200px] text-sm leading-relaxed border">
                    {renderDiffText(
                      trackChangesClause.baselineText,
                      trackChangesClause.ourPosition,
                      false
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setShowTrackChanges(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this template and all its clauses. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTemplate}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
