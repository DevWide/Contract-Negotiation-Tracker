// Contract Negotiation Tracker - ImportModal Component
// Design: Refined Legal Elegance - CSV import with preview

import { useState, useRef } from 'react';
import { useNegotiation } from '@/contexts/NegotiationContext';
import { useEscapeKey } from '@/hooks/useKeyboardShortcuts';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { parseCSV } from '@/lib/exportUtils';
import type { ClauseItem } from '@/types';

interface ImportModalProps {
  open: boolean;
  onClose: () => void;
}

export function ImportModal({ open, onClose }: ImportModalProps) {
  const { activeContract, importClauseItems } = useNegotiation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsedItems, setParsedItems] = useState<Partial<ClauseItem>[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  useEscapeKey(onClose, open);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const items = parseCSV(content);
        
        if (items.length === 0) {
          setError('No valid data found in the CSV file. Please check the format.');
          setParsedItems([]);
        } else {
          setParsedItems(items);
        }
      } catch (err) {
        setError('Failed to parse CSV file. Please check the format.');
        setParsedItems([]);
      }
    };
    reader.onerror = () => {
      setError('Failed to read file.');
      setParsedItems([]);
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (!activeContract || parsedItems.length === 0) return;
    importClauseItems(activeContract.id, parsedItems);
    handleClose();
  };

  const handleClose = () => {
    setParsedItems([]);
    setError(null);
    setFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Import Clauses from CSV</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden space-y-4">
          {/* File Upload */}
          <div 
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-[oklch(0.55_0.12_45)] transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
            <p className="font-medium">Click to select a CSV file</p>
            <p className="text-sm text-muted-foreground mt-1">
              or drag and drop
            </p>
          </div>

          {/* File Info */}
          {fileName && (
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <FileText className="w-5 h-5 text-[oklch(0.55_0.12_45)]" />
              <span className="font-medium">{fileName}</span>
              {parsedItems.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  ({parsedItems.length} clauses found)
                </span>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {/* Preview */}
          {parsedItems.length > 0 && (
            <div className="flex-1 overflow-hidden">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[oklch(0.45_0.08_160)]" />
                Preview
              </h4>
              <ScrollArea className="h-[300px] border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Clause #</TableHead>
                      <TableHead>Issue</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Owner</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono">{item.clauseNumber || '—'}</TableCell>
                        <TableCell>{item.issue || '—'}</TableCell>
                        <TableCell>{item.status || 'No Changes'}</TableCell>
                        <TableCell>{item.priority || 'Medium'}</TableCell>
                        <TableCell>{item.owner || 'Legal'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          )}

          {/* Format Help */}
          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-1">Expected CSV Format:</p>
            <p>
              Clause Number, Issue/Topic, Original Text, Rationale, Counter-Proposal, 
              Counter-Proposal Wording, Status, Priority, Owner, Impact Category, 
              Impact Subcategory, Risk Level
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleImport}
            disabled={parsedItems.length === 0}
            className="bg-[oklch(0.45_0.08_160)] hover:bg-[oklch(0.50_0.08_160)]"
          >
            Import {parsedItems.length} Clauses
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
