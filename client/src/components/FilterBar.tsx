// Contract Negotiation Tracker - FilterBar Component
// Design: Refined Legal Elegance - Search and filter controls

import { useNegotiation } from '@/contexts/NegotiationContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X, Filter, Download, Upload } from 'lucide-react';
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
  } = useNegotiation();

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
  };

  const handleExportJSON = () => {
    if (!activeContract) return;
    const json = exportToJSON(activeContract);
    const filename = generateFilename(activeContract.name, 'json');
    downloadFile(json, filename, 'application/json');
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
          onValueChange={value => setFilterState(prev => ({ ...prev, owner: value }))}
        >
          <SelectTrigger className="w-[130px] h-9">
            <SelectValue placeholder="Owner" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Owners</SelectItem>
            {formOptions.owners.map(owner => (
              <SelectItem key={owner} value={owner}>{owner}</SelectItem>
            ))}
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
    </div>
  );
}
