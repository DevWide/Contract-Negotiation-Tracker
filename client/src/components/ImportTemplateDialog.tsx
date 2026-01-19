// Contract Negotiation Tracker - Import Template Dialog
// Allows importing templates from PDF, DOCX, or TXT files with confidence scoring

import { useState, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Upload, 
  FileText, 
  Trash2, 
  AlertCircle, 
  Check,
  Loader2 
} from 'lucide-react';
import { parseFile, type ParsedDocument, type ParsedClause } from '@/lib/docxParser';

interface ImportTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (template: {
    name: string;
    description: string;
    clauses: Array<{
      clauseNumber: string;
      topic: string;
      clauseText: string;
      issue: string;
      rationale: string;
      proposedChange: string;
      counterProposal: string;
      counterproposalWording: string;
      impactCategory: string;
      impactSubcategory: string;
    }>;
  }) => void;
}

interface EditableClause extends ParsedClause {
  id: string;
  selected: boolean;
}

type ImportStep = 'upload' | 'preview' | 'success';

export function ImportTemplateDialog({
  open,
  onOpenChange,
  onImport,
}: ImportTemplateDialogProps) {
  const [step, setStep] = useState<ImportStep>('upload');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [templateDesc, setTemplateDesc] = useState('');
  const [clauses, setClauses] = useState<EditableClause[]>([]);
  const [expandedClause, setExpandedClause] = useState<string>('');
  const [parsedDocument, setParsedDocument] = useState<ParsedDocument | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = useCallback(() => {
    setStep('upload');
    setLoading(false);
    setError(null);
    setTemplateName('');
    setTemplateDesc('');
    setClauses([]);
    setExpandedClause('');
    setParsedDocument(null);
  }, []);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetState();
    }
    onOpenChange(newOpen);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const result = await parseFile(file);
      
      if (result.clauses.length === 0) {
        throw new Error('No clauses found in the document. Please check that the document has numbered sections.');
      }

      setTemplateName(result.title || file.name.replace(/\.[^/.]+$/, ''));
      setTemplateDesc(`Imported from ${file.name}`);
      setParsedDocument(result);
      setClauses(result.clauses.map((clause, index) => ({
        ...clause,
        id: `imported-${index}`,
        selected: true,
      })));
      setStep('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file');
    } finally {
      setLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClauseChange = (id: string, field: keyof ParsedClause, value: string | number) => {
    setClauses(prev => prev.map(c =>
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  const handleToggleClause = (id: string) => {
    setClauses(prev => prev.map(c =>
      c.id === id ? { ...c, selected: !c.selected } : c
    ));
  };

  const handleRemoveClause = (id: string) => {
    setClauses(prev => prev.filter(c => c.id !== id));
  };

  const handleSelectAll = () => {
    setClauses(prev => prev.map(c => ({ ...c, selected: true })));
  };

  const handleDeselectAll = () => {
    setClauses(prev => prev.map(c => ({ ...c, selected: false })));
  };

  const selectedCount = clauses.filter(c => c.selected).length;
  const lowConfidenceCount = clauses.filter(c => c.confidence < 70).length;

  const handleImport = () => {
    const selectedClauses = clauses.filter(c => c.selected);
    
    if (selectedClauses.length === 0) {
      setError('Please select at least one clause to import');
      return;
    }

    onImport({
      name: templateName.trim() || 'Imported Template',
      description: templateDesc.trim(),
      clauses: selectedClauses.map(clause => ({
        clauseNumber: clause.clauseNumber,
        topic: clause.topic, // Subclause title (e.g., "Affiliate", "Fees")
        clauseText: clause.clauseText,
        issue: clause.topic, // Use topic as issue for display
        rationale: '',
        proposedChange: '',
        counterProposal: '',
        counterproposalWording: '',
        impactCategory: clause.issue, // Section category (e.g., "Definitions", "Fees and Payment")
        impactSubcategory: '',
      })),
    });

    setStep('success');
    setTimeout(() => {
      handleOpenChange(false);
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Import Template from Document
          </DialogTitle>
          <DialogDescription>
            Upload a PDF, DOCX, or TXT file to extract clauses and create a new template
          </DialogDescription>
        </DialogHeader>

        {step === 'upload' && (
          <div className="flex-1 min-h-0 py-8">
            <div 
              className="border-2 border-dashed rounded-lg p-12 text-center hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {loading ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-12 h-12 text-muted-foreground animate-spin" />
                  <p className="text-muted-foreground">Analyzing document...</p>
                </div>
              ) : (
                <>
                  <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">
                    Drop your contract file here
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supported formats: .pdf, .docx, .txt
                  </p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {step === 'preview' && (
          <div className="flex-1 min-h-0 space-y-4">
            {/* Template Name & Description */}
            <div className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="import-name">Template Name</Label>
                  <Input
                    id="import-name"
                    value={templateName}
                    onChange={e => setTemplateName(e.target.value)}
                    placeholder="Enter template name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="import-desc">Description</Label>
                  <Input
                    id="import-desc"
                    value={templateDesc}
                    onChange={e => setTemplateDesc(e.target.value)}
                    placeholder="Template description"
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
                  {clauses.length} clauses detected • {selectedCount} selected
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

            {/* Clauses Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">
                  Extracted Clauses ({selectedCount} of {clauses.length} selected)
                </Label>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                    Select All
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleDeselectAll}>
                    Deselect All
                  </Button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <ScrollArea className="h-[280px] border rounded-lg">
                <Accordion
                  type="single"
                  collapsible
                  value={expandedClause}
                  onValueChange={setExpandedClause}
                  className="px-1"
                >
                  {clauses.map((clause) => (
                    <AccordionItem 
                      key={clause.id} 
                      value={clause.id} 
                      className={`border-b last:border-b-0 ${!clause.selected ? 'opacity-50' : ''}`}
                    >
                      <AccordionTrigger className="hover:no-underline py-3 px-2">
                        <div className="flex items-center gap-3 text-left w-full">
                          <Checkbox
                            checked={clause.selected}
                            onCheckedChange={() => handleToggleClause(clause.id)}
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
                          {clause.confidence < 70 && clause.warnings && (
                            <Tooltip>
                              <TooltipTrigger>
                                <AlertCircle className="w-4 h-4 text-amber-500" />
                              </TooltipTrigger>
                              <TooltipContent>
                                {clause.warnings.join(', ')}
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
                                onChange={e => handleClauseChange(clause.id, 'clauseNumber', e.target.value)}
                                className="h-8"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs">Topic</Label>
                              <Input
                                value={clause.topic}
                                onChange={e => handleClauseChange(clause.id, 'topic', e.target.value)}
                                className="h-8"
                              />
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs">Original Text</Label>
                            <Textarea
                              value={clause.clauseText}
                              onChange={e => handleClauseChange(clause.id, 'clauseText', e.target.value)}
                              rows={4}
                              className="text-sm"
                            />
                          </div>
                          <div className="flex justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveClause(clause.id)}
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
          </div>
        )}

        {step === 'success' && (
          <div className="flex-1 min-h-0 py-12">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-lg font-medium">Template Imported Successfully!</p>
              <p className="text-sm text-muted-foreground">
                {selectedCount} clauses imported into "{templateName}"
              </p>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setStep('upload')}>
              Back
            </Button>
            <Button 
              onClick={handleImport}
              disabled={selectedCount === 0}
            >
              Import {selectedCount} Clauses
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
