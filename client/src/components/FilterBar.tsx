// Contract Negotiation Tracker - FilterBar Component
// Design: Organic Modern Professional - Search and filter controls

import { useState } from 'react';
import { useNegotiation } from '@/contexts/NegotiationContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, X, Filter, Download, Upload, Plus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { exportToCSV, exportToJSON, downloadFile, generateFilename } from '@/lib/exportUtils';

interface FilterBarProps {
  onImport: () => void;
}

export function FilterBar({ onImport }: FilterBarProps) {
  const { 
    activeContract,
    filterState, 
    setFilterState, 
    formOptions,
    getCategoryNames,
    addOwner,
  } = useNegotiation();
  
  const { markFeatureDiscovered } = useOnboarding();

  const [showAddOwnerDialog, setShowAddOwnerDialog] = useState(false);
  const [newOwnerName, setNewOwnerName] = useState('');

  const hasFilters = 
    filterState.search !== '' ||
    filterState.status !== 'all' ||
    filterState.priority !== 'all' ||
    filterState.owner !== 'all' ||
    filterState.impactCategory !== 'all' ||
    filterState.riskLevel !== 'all';

  const clearFilters = () => {
    setFilterState({
      search: '',
      status: 'all',
      priority: 'all',
      owner: 'all',
      impactCategory: 'all',
      riskLevel: 'all',
    });
  };

  const handleExportCSV = () => {
    if (!activeContract) return;
    const csv = exportToCSV(activeContract);
    const filename = generateFilename(activeContract.name, 'csv');
    downloadFile(csv, filename, 'text/csv');
    markFeatureDiscovered('export-data');
  };

  const handleExportJSON = () => {
    if (!activeContract) return;
    const json = exportToJSON(activeContract);
    const filename = generateFilename(activeContract.name, 'json');
    downloadFile(json, filename, 'application/json');
    markFeatureDiscovered('export-data');
  };

  const categoryNames = getCategoryNames();

  return (
    <div className="space-y-3">
      {/* Search and Actions Row */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search clauses..."
            value={filterState.search}
            onChange={e => setFilterState(prev => ({ ...prev, search: e.target.value }))}
            className="pl-9 pr-9"
          />
          {filterState.search && (
            <button
              onClick={() => setFilterState(prev => ({ ...prev, search: '' }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Export */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportCSV}>
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportJSON}>
                Export as JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Import */}
          <Button variant="outline" size="sm" onClick={onImport}>
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="w-4 h-4" />
          <span>Filters:</span>
        </div>

        <Select
          value={filterState.status}
          onValueChange={value => setFilterState(prev => ({ ...prev, status: value as any }))}
        >
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {formOptions.statuses.map(status => (
              <SelectItem key={status} value={status}>{status}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filterState.priority}
          onValueChange={value => setFilterState(prev => ({ ...prev, priority: value as any }))}
        >
          <SelectTrigger className="w-[130px] h-9">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            {formOptions.priorities.map(priority => (
              <SelectItem key={priority} value={priority}>{priority}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filterState.owner}
          onValueChange={value => {
            if (value === '__add_new__') {
              setShowAddOwnerDialog(true);
            } else {
              setFilterState(prev => ({ ...prev, owner: value }));
            }
          }}
        >
          <SelectTrigger className="w-[130px] h-9">
            <SelectValue placeholder="Owner" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Owners</SelectItem>
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

        <Select
          value={filterState.impactCategory}
          onValueChange={value => setFilterState(prev => ({ ...prev, impactCategory: value }))}
        >
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Impact" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categoryNames.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filterState.riskLevel}
          onValueChange={value => setFilterState(prev => ({ ...prev, riskLevel: value as any }))}
        >
          <SelectTrigger className="w-[120px] h-9">
            <SelectValue placeholder="Risk" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Risks</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}
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
            <Label htmlFor="new-owner-name">Owner Name</Label>
            <Input
              id="new-owner-name"
              value={newOwnerName}
              onChange={(e) => setNewOwnerName(e.target.value)}
              placeholder="e.g., Marketing, Engineering..."
              className="mt-2"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newOwnerName.trim()) {
                  addOwner(newOwnerName.trim());
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
    </div>
  );
}
