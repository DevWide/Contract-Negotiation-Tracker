// Contract Negotiation Tracker - NegotiationContext
// Global state management for the application

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { 
  Contract, ClauseItem, FilterState, SortState, 
  Template, PlaybookTopic, ImpactCategory, ColumnConfig 
} from '@/types';
import { useContracts } from '@/hooks/useContracts';
import { useTemplates } from '@/hooks/useTemplates';
import { usePlaybook } from '@/hooks/usePlaybook';
import { useColumnConfig } from '@/hooks/useColumnConfig';
import { useImpactConfig } from '@/hooks/useImpactConfig';
import { useVersionHistory } from '@/hooks/useVersionHistory';
import { useAnnotations } from '@/hooks/useAnnotations';
import { defaultFormOptions } from '@/data/sampleData';

interface NegotiationContextType {
  // Contracts
  contracts: Contract[];
  activeContract: Contract | null;
  activeContractId: number | null;
  setActiveContractId: (id: number | null) => void;
  createContract: ReturnType<typeof useContracts>['createContract'];
  createContractFromTemplate: ReturnType<typeof useContracts>['createContractFromTemplate'];
  updateContract: ReturnType<typeof useContracts>['updateContract'];
  deleteContract: ReturnType<typeof useContracts>['deleteContract'];
  duplicateContract: ReturnType<typeof useContracts>['duplicateContract'];
  archiveContract: ReturnType<typeof useContracts>['archiveContract'];
  toggleBallInCourt: ReturnType<typeof useContracts>['toggleBallInCourt'];
  
  // Clause Items
  addClauseItem: ReturnType<typeof useContracts>['addClauseItem'];
  updateClauseItem: ReturnType<typeof useContracts>['updateClauseItem'];
  deleteClauseItem: ReturnType<typeof useContracts>['deleteClauseItem'];
  importClauseItems: ReturnType<typeof useContracts>['importClauseItems'];
  
  // Timeline
  addTimelineEvent: ReturnType<typeof useContracts>['addTimelineEvent'];
  updateTimelineEvent: ReturnType<typeof useContracts>['updateTimelineEvent'];
  deleteTimelineEvent: ReturnType<typeof useContracts>['deleteTimelineEvent'];
  
  // Templates
  templates: Template[];
  createTemplate: ReturnType<typeof useTemplates>['createTemplate'];
  updateTemplate: ReturnType<typeof useTemplates>['updateTemplate'];
  deleteTemplate: ReturnType<typeof useTemplates>['deleteTemplate'];
  duplicateTemplate: ReturnType<typeof useTemplates>['duplicateTemplate'];
  addClauseToTemplate: ReturnType<typeof useTemplates>['addClauseToTemplate'];
  updateTemplateClause: ReturnType<typeof useTemplates>['updateTemplateClause'];
  deleteTemplateClause: ReturnType<typeof useTemplates>['deleteTemplateClause'];
  
  // Playbook
  playbookTopics: PlaybookTopic[];
  playbookCategories: string[];
  getTopicsByCategory: ReturnType<typeof usePlaybook>['getTopicsByCategory'];
  getTopicsForClauseType: ReturnType<typeof usePlaybook>['getTopicsForClauseType'];
  searchPlaybookTopics: ReturnType<typeof usePlaybook>['searchTopics'];
  createPlaybookTopic: ReturnType<typeof usePlaybook>['createTopic'];
  updatePlaybookTopic: ReturnType<typeof usePlaybook>['updateTopic'];
  deletePlaybookTopic: ReturnType<typeof usePlaybook>['deleteTopic'];
  
  // Column Config
  columns: ColumnConfig[];
  visibleColumns: ColumnConfig[];
  toggleColumn: ReturnType<typeof useColumnConfig>['toggleColumn'];
  setColumnVisible: ReturnType<typeof useColumnConfig>['setColumnVisible'];
  setColumnWidth: ReturnType<typeof useColumnConfig>['setColumnWidth'];
  reorderColumns: ReturnType<typeof useColumnConfig>['reorderColumns'];
  resetColumns: ReturnType<typeof useColumnConfig>['resetColumns'];
  addCustomColumn: ReturnType<typeof useColumnConfig>['addCustomColumn'];
  
  // Impact Categories
  impactCategories: ImpactCategory[];
  getCategoryNames: ReturnType<typeof useImpactConfig>['getCategoryNames'];
  getSubcategories: ReturnType<typeof useImpactConfig>['getSubcategories'];
  addImpactCategory: ReturnType<typeof useImpactConfig>['addCategory'];
  updateImpactCategory: ReturnType<typeof useImpactConfig>['updateCategory'];
  deleteImpactCategory: ReturnType<typeof useImpactConfig>['deleteCategory'];
  addSubcategory: ReturnType<typeof useImpactConfig>['addSubcategory'];
  removeSubcategory: ReturnType<typeof useImpactConfig>['removeSubcategory'];
  resetImpactCategories: ReturnType<typeof useImpactConfig>['resetCategories'];
  
  // Version History
  saveVersion: ReturnType<typeof useVersionHistory>['saveVersion'];
  deleteVersion: ReturnType<typeof useVersionHistory>['deleteVersion'];
  restoreVersion: ReturnType<typeof useVersionHistory>['restoreVersion'];
  startNewRound: ReturnType<typeof useVersionHistory>['startNewRound'];
  saveTheirProposal: ReturnType<typeof useVersionHistory>['saveTheirProposal'];
  saveOurCounter: ReturnType<typeof useVersionHistory>['saveOurCounter'];
  getCurrentRound: ReturnType<typeof useVersionHistory>['getCurrentRound'];
  getVersionsByRound: ReturnType<typeof useVersionHistory>['getVersionsByRound'];
  getLatestPositions: ReturnType<typeof useVersionHistory>['getLatestPositions'];
  
  // Annotations
  addAnnotation: ReturnType<typeof useAnnotations>['addAnnotation'];
  updateAnnotation: ReturnType<typeof useAnnotations>['updateAnnotation'];
  deleteAnnotation: ReturnType<typeof useAnnotations>['deleteAnnotation'];
  
  // Filtering & Sorting
  filterState: FilterState;
  setFilterState: React.Dispatch<React.SetStateAction<FilterState>>;
  sortState: SortState;
  setSortState: React.Dispatch<React.SetStateAction<SortState>>;
  filteredItems: ClauseItem[];
  
  // Form Options
  formOptions: typeof defaultFormOptions;
  
  // Data Management
  clearAllData: () => void;
  resetToSampleData: () => void;
  
  // UI State
  selectedItemId: number | null;
  setSelectedItemId: (id: number | null) => void;
  editingItemId: number | null;
  setEditingItemId: (id: number | null) => void;
}

const NegotiationContext = createContext<NegotiationContextType | null>(null);

export function NegotiationProvider({ children }: { children: React.ReactNode }) {
  // Core hooks
  const contractsHook = useContracts();
  const templatesHook = useTemplates();
  const playbookHook = usePlaybook();
  const columnConfigHook = useColumnConfig();
  const impactConfigHook = useImpactConfig();
  const versionHistoryHook = useVersionHistory(contractsHook.updateClauseItem);
  const annotationsHook = useAnnotations(contractsHook.updateClauseItem);

  // UI State
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);

  // Filter & Sort State
  const [filterState, setFilterState] = useState<FilterState>({
    search: '',
    status: 'all',
    priority: 'all',
    owner: 'all',
    impactCategory: 'all',
    riskLevel: 'all',
  });

  const [sortState, setSortState] = useState<SortState>({
    column: null,
    direction: 'asc',
  });

  // Filtered and sorted items
  const filteredItems = useMemo(() => {
    if (!contractsHook.activeContract) return [];

    let items = [...contractsHook.activeContract.items];

    // Apply search filter
    if (filterState.search) {
      const searchLower = filterState.search.toLowerCase();
      items = items.filter(item =>
        item.clauseNumber.toLowerCase().includes(searchLower) ||
        item.issue.toLowerCase().includes(searchLower) ||
        item.clauseText.toLowerCase().includes(searchLower) ||
        item.proposedChange.toLowerCase().includes(searchLower) ||
        item.counterProposal.toLowerCase().includes(searchLower) ||
        item.counterproposalWording.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (filterState.status !== 'all') {
      items = items.filter(item => item.status === filterState.status);
    }

    // Apply priority filter
    if (filterState.priority !== 'all') {
      items = items.filter(item => item.priority === filterState.priority);
    }

    // Apply owner filter
    if (filterState.owner !== 'all') {
      items = items.filter(item => item.owner === filterState.owner);
    }

    // Apply impact category filter
    if (filterState.impactCategory !== 'all') {
      items = items.filter(item => item.impactCategory === filterState.impactCategory);
    }

    // Apply risk level filter
    if (filterState.riskLevel !== 'all') {
      items = items.filter(item => item.riskLevel === filterState.riskLevel);
    }

    // Apply sorting
    if (sortState.column) {
      items.sort((a, b) => {
        const aVal = a[sortState.column as keyof ClauseItem];
        const bVal = b[sortState.column as keyof ClauseItem];
        
        if (aVal === undefined || aVal === null) return 1;
        if (bVal === undefined || bVal === null) return -1;
        
        let comparison = 0;
        
        // Use natural sorting for clause numbers (e.g., 5.1 before 12.1)
        if (sortState.column === 'clauseNumber' && typeof aVal === 'string' && typeof bVal === 'string') {
          comparison = aVal.localeCompare(bVal, undefined, { numeric: true, sensitivity: 'base' });
        } else if (typeof aVal === 'string' && typeof bVal === 'string') {
          comparison = aVal.localeCompare(bVal);
        } else {
          comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        }
        
        return sortState.direction === 'asc' ? comparison : -comparison;
      });
    }

    return items;
  }, [contractsHook.activeContract, filterState, sortState]);

  const value: NegotiationContextType = {
    // Contracts
    contracts: contractsHook.contracts,
    activeContract: contractsHook.activeContract,
    activeContractId: contractsHook.activeContractId,
    setActiveContractId: contractsHook.setActiveContractId,
    createContract: contractsHook.createContract,
    createContractFromTemplate: contractsHook.createContractFromTemplate,
    updateContract: contractsHook.updateContract,
    deleteContract: contractsHook.deleteContract,
    duplicateContract: contractsHook.duplicateContract,
    archiveContract: contractsHook.archiveContract,
    toggleBallInCourt: contractsHook.toggleBallInCourt,
    
    // Clause Items
    addClauseItem: contractsHook.addClauseItem,
    updateClauseItem: contractsHook.updateClauseItem,
    deleteClauseItem: contractsHook.deleteClauseItem,
    importClauseItems: contractsHook.importClauseItems,
    
    // Timeline
    addTimelineEvent: contractsHook.addTimelineEvent,
    updateTimelineEvent: contractsHook.updateTimelineEvent,
    deleteTimelineEvent: contractsHook.deleteTimelineEvent,
    
    // Templates
    templates: templatesHook.templates,
    createTemplate: templatesHook.createTemplate,
    updateTemplate: templatesHook.updateTemplate,
    deleteTemplate: templatesHook.deleteTemplate,
    duplicateTemplate: templatesHook.duplicateTemplate,
    addClauseToTemplate: templatesHook.addClauseToTemplate,
    updateTemplateClause: templatesHook.updateTemplateClause,
    deleteTemplateClause: templatesHook.deleteTemplateClause,
    
    // Playbook
    playbookTopics: playbookHook.topics,
    playbookCategories: playbookHook.categories,
    getTopicsByCategory: playbookHook.getTopicsByCategory,
    getTopicsForClauseType: playbookHook.getTopicsForClauseType,
    searchPlaybookTopics: playbookHook.searchTopics,
    createPlaybookTopic: playbookHook.createTopic,
    updatePlaybookTopic: playbookHook.updateTopic,
    deletePlaybookTopic: playbookHook.deleteTopic,
    
    // Column Config
    columns: columnConfigHook.columns,
    visibleColumns: columnConfigHook.visibleColumns,
    toggleColumn: columnConfigHook.toggleColumn,
    setColumnVisible: columnConfigHook.setColumnVisible,
    setColumnWidth: columnConfigHook.setColumnWidth,
    reorderColumns: columnConfigHook.reorderColumns,
    resetColumns: columnConfigHook.resetColumns,
    addCustomColumn: columnConfigHook.addCustomColumn,
    
    // Impact Categories
    impactCategories: impactConfigHook.categories,
    getCategoryNames: impactConfigHook.getCategoryNames,
    getSubcategories: impactConfigHook.getSubcategories,
    addImpactCategory: impactConfigHook.addCategory,
    updateImpactCategory: impactConfigHook.updateCategory,
    deleteImpactCategory: impactConfigHook.deleteCategory,
    addSubcategory: impactConfigHook.addSubcategory,
    removeSubcategory: impactConfigHook.removeSubcategory,
    resetImpactCategories: impactConfigHook.resetCategories,
    
    // Version History
    saveVersion: versionHistoryHook.saveVersion,
    deleteVersion: versionHistoryHook.deleteVersion,
    restoreVersion: versionHistoryHook.restoreVersion,
    startNewRound: versionHistoryHook.startNewRound,
    saveTheirProposal: versionHistoryHook.saveTheirProposal,
    saveOurCounter: versionHistoryHook.saveOurCounter,
    getCurrentRound: versionHistoryHook.getCurrentRound,
    getVersionsByRound: versionHistoryHook.getVersionsByRound,
    getLatestPositions: versionHistoryHook.getLatestPositions,
    
    // Annotations
    addAnnotation: annotationsHook.addAnnotation,
    updateAnnotation: annotationsHook.updateAnnotation,
    deleteAnnotation: annotationsHook.deleteAnnotation,
    
    // Filtering & Sorting
    filterState,
    setFilterState,
    sortState,
    setSortState,
    filteredItems,
    
    // Form Options
    formOptions: defaultFormOptions,
    
    // Data Management
    clearAllData: contractsHook.clearAllData,
    resetToSampleData: contractsHook.resetToSampleData,
    
    // UI State
    selectedItemId,
    setSelectedItemId,
    editingItemId,
    setEditingItemId,
  };

  return (
    <NegotiationContext.Provider value={value}>
      {children}
    </NegotiationContext.Provider>
  );
}

export function useNegotiation() {
  const context = useContext(NegotiationContext);
  if (!context) {
    throw new Error('useNegotiation must be used within a NegotiationProvider');
  }
  return context;
}
