// Contract Negotiation Tracker - ClauseTable Component
// Design: Organic Modern Professional - Main data table with full inline editing

import { useState, useRef, useEffect } from 'react';
import { useNegotiation } from '@/contexts/NegotiationContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  ArrowUpDown, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2,
  GitCompare,
  ChevronUp,
  ChevronDown,
  Check,
  X,
  Pencil,
  BookOpen,
  Plus
} from 'lucide-react';
import type { ClauseItem, ClauseStatus, Priority, RiskLevel } from '@/types';

interface ClauseTableProps {
  onViewItem: (item: ClauseItem) => void;
  onEditItem: (item: ClauseItem) => void;
  onCompareItem: (item: ClauseItem) => void;
  onDeleteItem: (item: ClauseItem) => void;
  onViewPlaybook?: (item: ClauseItem) => void;
}

// Inline text editor component
function InlineTextEditor({
  value,
  onSave,
  multiline = false,
  placeholder = '',
  className = '',
}: {
  value: string;
  onSave: (value: string) => void;
  multiline?: boolean;
  placeholder?: string;
  className?: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleSave = () => {
    onSave(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Enter' && multiline && e.metaKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    if (multiline) {
      return (
        <div className="flex flex-col gap-1">
          <Textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            placeholder={placeholder}
            className="min-h-[80px] text-sm resize-none"
            rows={3}
          />
          <div className="flex gap-1 justify-end">
            <Button size="sm" variant="ghost" className="h-6 px-2" onClick={handleCancel}>
              <X className="w-3 h-3" />
            </Button>
            <Button size="sm" className="h-6 px-2" onClick={handleSave}>
              <Check className="w-3 h-3" />
            </Button>
          </div>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1">
        <Input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          placeholder={placeholder}
          className="h-7 text-sm"
        />
      </div>
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={`group cursor-pointer rounded px-1 py-0.5 -mx-1 hover:bg-muted/70 transition-colors ${className}`}
    >
      <div className="flex items-center gap-1">
        <span className={value ? '' : 'text-muted-foreground italic'}>
          {value || placeholder || '—'}
        </span>
        <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity flex-shrink-0" />
      </div>
    </div>
  );
}

// Popover text editor for longer content
function PopoverTextEditor({
  value,
  onSave,
  label,
  placeholder = '',
  displayValue,
}: {
  value: string;
  onSave: (value: string) => void;
  label: string;
  placeholder?: string;
  displayValue?: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [editValue, setEditValue] = useState(value);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleSave = () => {
    onSave(editValue);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="group cursor-pointer rounded px-1 py-0.5 -mx-1 hover:bg-muted/70 transition-colors">
          <div className="flex items-center gap-1">
            {displayValue || (
              <span className={value ? 'line-clamp-2' : 'text-muted-foreground italic'}>
                {value || placeholder || '—'}
              </span>
            )}
            <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity flex-shrink-0" />
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-3">
          <h4 className="font-medium text-sm">{label}</h4>
          <Textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            placeholder={placeholder}
            className="min-h-[120px] text-sm"
            rows={5}
          />
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function ClauseTable({ 
  onViewItem, 
  onEditItem, 
  onCompareItem,
  onDeleteItem,
  onViewPlaybook
}: ClauseTableProps) {
  const { 
    activeContract,
    filteredItems, 
    visibleColumns,
    sortState,
    setSortState,
    updateClauseItem,
    formOptions,
    selectedItemId,
    setSelectedItemId,
    impactCategories,
    addImpactCategory,
    addSubcategory,
    getSubcategories,
    addOwner,
  } = useNegotiation();

  const [showAddOwnerDialog, setShowAddOwnerDialog] = useState(false);
  const [newOwnerName, setNewOwnerName] = useState('');
  const [pendingOwnerItem, setPendingOwnerItem] = useState<ClauseItem | null>(null);

  // Impact Category dialog state
  const [showAddCategoryDialog, setShowAddCategoryDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [pendingCategoryItem, setPendingCategoryItem] = useState<ClauseItem | null>(null);

  // Subcategory dialog state
  const [showAddSubcategoryDialog, setShowAddSubcategoryDialog] = useState(false);
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [pendingSubcategoryItem, setPendingSubcategoryItem] = useState<ClauseItem | null>(null);

  if (!activeContract) return null;

  const handleSort = (column: string) => {
    setSortState(prev => ({
      column: column as any,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleFieldChange = (item: ClauseItem, field: keyof ClauseItem, value: any) => {
    updateClauseItem(activeContract.id, item.id, { [field]: value });
  };

  const getStatusBadgeClass = (status: ClauseStatus) => {
    switch (status) {
      case 'Agreed': return 'status-agreed';
      case 'In Discussion': return 'status-discussion';
      case 'Blocked': return 'status-blocked';
      case 'Escalated': return 'status-escalated';
      case 'No Changes': return 'status-nochanges';
      default: return '';
    }
  };

  const getPriorityBadgeClass = (priority: Priority) => {
    switch (priority) {
      case 'High': return 'priority-high';
      case 'Medium': return 'priority-medium';
      case 'Low': return 'priority-low';
      default: return '';
    }
  };

  const getRiskBadgeClass = (risk: RiskLevel) => {
    switch (risk) {
      case 'critical': return 'bg-[oklch(0.92_0.08_15)] text-[oklch(0.35_0.14_15)] border-[oklch(0.80_0.10_15)]';
      case 'high': return 'bg-[oklch(0.92_0.06_25)] text-[oklch(0.40_0.12_25)] border-[oklch(0.80_0.08_25)]';
      case 'medium': return 'bg-[oklch(0.92_0.06_55)] text-[oklch(0.45_0.12_55)] border-[oklch(0.80_0.08_55)]';
      case 'low': return 'bg-[oklch(0.92_0.04_160)] text-[oklch(0.35_0.08_160)] border-[oklch(0.80_0.06_160)]';
      default: return '';
    }
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortState.column !== column) {
      return <ArrowUpDown className="w-4 h-4 ml-1 opacity-50" />;
    }
    return sortState.direction === 'asc' 
      ? <ChevronUp className="w-4 h-4 ml-1" />
      : <ChevronDown className="w-4 h-4 ml-1" />;
  };

  const renderCell = (item: ClauseItem, columnId: string) => {
    switch (columnId) {
      case 'clauseNumber':
        return (
          <InlineTextEditor
            value={item.clauseNumber}
            onSave={(value) => handleFieldChange(item, 'clauseNumber', value)}
            placeholder="e.g., 5.1"
            className="font-mono text-sm font-medium text-[oklch(0.45_0.08_160)]"
          />
        );
      
      case 'topic':
        return (
          <InlineTextEditor
            value={item.topic}
            onSave={(value) => handleFieldChange(item, 'topic', value)}
            placeholder="Topic"
            className="font-medium text-sm"
          />
        );
      
      case 'issue':
        return (
          <div className="max-w-[200px]">
            <InlineTextEditor
              value={item.issue}
              onSave={(value) => handleFieldChange(item, 'issue', value)}
              placeholder="Issue"
              className="font-medium"
            />
            <PopoverTextEditor
              value={item.rationale}
              onSave={(value) => handleFieldChange(item, 'rationale', value)}
              label="Edit Rationale"
              placeholder="Enter negotiation rationale..."
              displayValue={
                item.rationale ? (
                  <p className="text-xs text-muted-foreground truncate mt-0.5 max-w-[180px]">
                    {item.rationale}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground/50 italic mt-0.5">
                    Add rationale...
                  </p>
                )
              }
            />
          </div>
        );
      
      case 'status':
        return (
          <Select
            value={item.status}
            onValueChange={(value: ClauseStatus) => handleFieldChange(item, 'status', value)}
          >
            <SelectTrigger className="h-8 w-[130px] border-0 bg-transparent p-0">
              <Badge variant="outline" className={`${getStatusBadgeClass(item.status)} cursor-pointer`}>
                {item.status}
              </Badge>
            </SelectTrigger>
            <SelectContent>
              {formOptions.statuses.map(status => (
                <SelectItem key={status} value={status}>
                  <Badge variant="outline" className={getStatusBadgeClass(status)}>
                    {status}
                  </Badge>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'priority':
        return (
          <Select
            value={item.priority}
            onValueChange={(value: Priority) => handleFieldChange(item, 'priority', value)}
          >
            <SelectTrigger className="h-8 w-[100px] border-0 bg-transparent p-0">
              <Badge variant="outline" className={`${getPriorityBadgeClass(item.priority)} cursor-pointer`}>
                {item.priority}
              </Badge>
            </SelectTrigger>
            <SelectContent>
              {formOptions.priorities.map(priority => (
                <SelectItem key={priority} value={priority}>
                  <Badge variant="outline" className={getPriorityBadgeClass(priority)}>
                    {priority}
                  </Badge>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'owner':
        return (
          <Select
            value={item.owner}
            onValueChange={(value: string) => {
              if (value === '__add_new__') {
                setPendingOwnerItem(item);
                setShowAddOwnerDialog(true);
              } else {
                handleFieldChange(item, 'owner', value);
              }
            }}
          >
            <SelectTrigger className="h-8 w-[110px] text-sm">
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
        );
      
      case 'impactCategory':
        return (
          <div className="flex flex-col gap-1">
            <Select
              value={item.impactCategory}
              onValueChange={(value: string) => {
                if (value === '__add_new__') {
                  setPendingCategoryItem(item);
                  setShowAddCategoryDialog(true);
                } else {
                  handleFieldChange(item, 'impactCategory', value);
                  // Reset subcategory when category changes
                  handleFieldChange(item, 'impactSubcategory', '');
                }
              }}
            >
              <SelectTrigger className="h-7 w-[120px] text-xs">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {impactCategories.map(cat => (
                  <SelectItem key={cat.name} value={cat.name}>{cat.name}</SelectItem>
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
            {item.impactCategory && (
              <Select
                value={item.impactSubcategory}
                onValueChange={(value: string) => {
                  if (value === '__add_new__') {
                    setPendingSubcategoryItem(item);
                    setShowAddSubcategoryDialog(true);
                  } else {
                    handleFieldChange(item, 'impactSubcategory', value);
                  }
                }}
              >
                <SelectTrigger className="h-6 w-[120px] text-xs text-muted-foreground">
                  <SelectValue placeholder="Subcategory" />
                </SelectTrigger>
                <SelectContent>
                  {getSubcategories(item.impactCategory).map(sub => (
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
            )}
          </div>
        );
      
      case 'riskLevel':
        return (
          <Select
            value={item.riskLevel}
            onValueChange={(value: RiskLevel) => handleFieldChange(item, 'riskLevel', value)}
          >
            <SelectTrigger className="h-8 w-[100px] border-0 bg-transparent p-0">
              <Badge variant="outline" className={`${getRiskBadgeClass(item.riskLevel)} cursor-pointer`}>
                {item.riskLevel.charAt(0).toUpperCase() + item.riskLevel.slice(1)}
              </Badge>
            </SelectTrigger>
            <SelectContent>
              {formOptions.riskLevels.map(risk => (
                <SelectItem key={risk} value={risk}>
                  <Badge variant="outline" className={getRiskBadgeClass(risk)}>
                    {risk.charAt(0).toUpperCase() + risk.slice(1)}
                  </Badge>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'baselineText':
        return (
          <PopoverTextEditor
            value={item.baselineText}
            onSave={(value) => handleFieldChange(item, 'baselineText', value)}
            label="Edit Baseline Text"
            placeholder="Enter baseline clause text..."
            displayValue={
              <p className="text-sm text-muted-foreground line-clamp-2 max-w-[250px]">
                {item.baselineText || <span className="italic">No text</span>}
              </p>
            }
          />
        );
      
      case 'theirPosition':
        return (
          <PopoverTextEditor
            value={item.theirPosition}
            onSave={(value) => handleFieldChange(item, 'theirPosition', value)}
            label="Edit Their Position"
            placeholder="Enter counterparty's proposed text..."
            displayValue={
              <p className="text-sm text-muted-foreground line-clamp-2 max-w-[250px]">
                {item.theirPosition || <span className="italic">—</span>}
              </p>
            }
          />
        );
      
      case 'ourPosition':
        return (
          <PopoverTextEditor
            value={item.ourPosition}
            onSave={(value) => handleFieldChange(item, 'ourPosition', value)}
            label="Edit Our Position"
            placeholder="Enter our proposed text..."
            displayValue={
              <p className="text-sm text-muted-foreground line-clamp-2 max-w-[250px]">
                {item.ourPosition || <span className="italic">—</span>}
              </p>
            }
          />
        );
      
      case 'currentRound':
        return (
          <Badge variant="outline" className="font-mono text-xs">
            Round {item.currentRound || 0}
          </Badge>
        );
      
      case 'rationale':
        return (
          <PopoverTextEditor
            value={item.rationale}
            onSave={(value) => handleFieldChange(item, 'rationale', value)}
            label="Edit Rationale"
            placeholder="Enter negotiation rationale..."
            displayValue={
              <p className="text-sm text-muted-foreground line-clamp-2 max-w-[200px]">
                {item.rationale || <span className="italic">—</span>}
              </p>
            }
          />
        );
      
      default:
        return null;
    }
  };

  if (filteredItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <img 
          src="/images/empty-state.jpg" 
          alt="No clauses" 
          className="w-32 h-32 object-cover rounded-lg mb-4 opacity-80"
        />
        <h3 className="font-serif text-lg font-medium mb-1">No clauses found</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          {activeContract.items.length === 0 
            ? 'Add your first clause to start tracking negotiations.'
            : 'Try adjusting your filters to see more results.'}
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              {visibleColumns.map(column => (
                <TableHead 
                  key={column.id}
                  className="whitespace-nowrap"
                  style={{ width: column.width }}
                >
                  <button
                    onClick={() => handleSort(column.id)}
                    className="flex items-center hover:text-foreground transition-colors"
                  >
                    {column.label}
                    <SortIcon column={column.id} />
                  </button>
                </TableHead>
              ))}
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map(item => (
              <TableRow 
                key={item.id}
                className={`transition-colors ${
                  selectedItemId === item.id ? 'bg-accent' : 'hover:bg-muted/50'
                }`}
                onClick={(e) => {
                  // Only select if clicking on the row itself, not on interactive elements
                  if ((e.target as HTMLElement).closest('button, select, input, textarea, [role="combobox"]')) {
                    return;
                  }
                  setSelectedItemId(item.id);
                }}
              >
                {visibleColumns.map(column => (
                  <TableCell key={column.id} className="py-3 align-top">
                    {renderCell(item, column.id)}
                  </TableCell>
                ))}
                <TableCell className="align-top">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewItem(item)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onCompareItem(item)}>
                        <GitCompare className="w-4 h-4 mr-2" />
                        Compare Text
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEditItem(item)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit All Fields
                      </DropdownMenuItem>
                      {onViewPlaybook && (
                        <DropdownMenuItem onClick={() => onViewPlaybook(item)}>
                          <BookOpen className="w-4 h-4 mr-2" />
                          View Playbook
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        onClick={() => onDeleteItem(item)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Inline editing hint */}
      <div className="px-4 py-2 bg-muted/30 border-t text-xs text-muted-foreground flex items-center gap-2">
        <Pencil className="w-3 h-3" />
        <span>Click on any cell to edit inline. Press Enter to save, Escape to cancel.</span>
      </div>

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
            <Label htmlFor="clause-new-owner-name">Owner Name</Label>
            <Input
              id="clause-new-owner-name"
              value={newOwnerName}
              onChange={(e) => setNewOwnerName(e.target.value)}
              placeholder="e.g., Marketing, Engineering..."
              className="mt-2"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newOwnerName.trim()) {
                  addOwner(newOwnerName.trim());
                  if (pendingOwnerItem) {
                    handleFieldChange(pendingOwnerItem, 'owner', newOwnerName.trim());
                  }
                  setNewOwnerName('');
                  setPendingOwnerItem(null);
                  setShowAddOwnerDialog(false);
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setNewOwnerName('');
              setPendingOwnerItem(null);
              setShowAddOwnerDialog(false);
            }}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (newOwnerName.trim()) {
                  addOwner(newOwnerName.trim());
                  if (pendingOwnerItem) {
                    handleFieldChange(pendingOwnerItem, 'owner', newOwnerName.trim());
                  }
                  setNewOwnerName('');
                  setPendingOwnerItem(null);
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

      {/* Add New Impact Category Dialog */}
      <Dialog open={showAddCategoryDialog} onOpenChange={setShowAddCategoryDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Add New Impact Category</DialogTitle>
            <DialogDescription>
              Add a new impact category for clause classification.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="clause-new-category-name">Category Name</Label>
            <Input
              id="clause-new-category-name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="e.g., Security, Technology..."
              className="mt-2"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newCategoryName.trim()) {
                  addImpactCategory(newCategoryName.trim());
                  if (pendingCategoryItem) {
                    handleFieldChange(pendingCategoryItem, 'impactCategory', newCategoryName.trim());
                    handleFieldChange(pendingCategoryItem, 'impactSubcategory', '');
                  }
                  setNewCategoryName('');
                  setPendingCategoryItem(null);
                  setShowAddCategoryDialog(false);
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setNewCategoryName('');
              setPendingCategoryItem(null);
              setShowAddCategoryDialog(false);
            }}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (newCategoryName.trim()) {
                  addImpactCategory(newCategoryName.trim());
                  if (pendingCategoryItem) {
                    handleFieldChange(pendingCategoryItem, 'impactCategory', newCategoryName.trim());
                    handleFieldChange(pendingCategoryItem, 'impactSubcategory', '');
                  }
                  setNewCategoryName('');
                  setPendingCategoryItem(null);
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
              Add a new subcategory under "{pendingSubcategoryItem?.impactCategory}".
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="clause-new-subcategory-name">Subcategory Name</Label>
            <Input
              id="clause-new-subcategory-name"
              value={newSubcategoryName}
              onChange={(e) => setNewSubcategoryName(e.target.value)}
              placeholder="e.g., Data Protection, Audit Rights..."
              className="mt-2"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newSubcategoryName.trim() && pendingSubcategoryItem) {
                  addSubcategory(pendingSubcategoryItem.impactCategory, newSubcategoryName.trim());
                  handleFieldChange(pendingSubcategoryItem, 'impactSubcategory', newSubcategoryName.trim());
                  setNewSubcategoryName('');
                  setPendingSubcategoryItem(null);
                  setShowAddSubcategoryDialog(false);
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setNewSubcategoryName('');
              setPendingSubcategoryItem(null);
              setShowAddSubcategoryDialog(false);
            }}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (newSubcategoryName.trim() && pendingSubcategoryItem) {
                  addSubcategory(pendingSubcategoryItem.impactCategory, newSubcategoryName.trim());
                  handleFieldChange(pendingSubcategoryItem, 'impactSubcategory', newSubcategoryName.trim());
                  setNewSubcategoryName('');
                  setPendingSubcategoryItem(null);
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
    </div>
  );
}
