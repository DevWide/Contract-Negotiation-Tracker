// Contract Negotiation Tracker - SettingsModal Component
// Design: Refined Legal Elegance - Unified settings for columns, templates, categories, data management

import { useState } from 'react';
import { useNegotiation } from '@/contexts/NegotiationContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useEscapeKey } from '@/hooks/useKeyboardShortcuts';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { 
  Columns, 
  FileText, 
  Database, 
  Trash2, 
  RotateCcw,
  Download,
  Plus,
  GripVertical,
  Tags,
  ChevronDown,
  X,
  Pencil,
  Upload,
  BookOpen,
  AlertTriangle,
  ChevronUp,
  HelpCircle,
  Palette,
  Sun,
  Moon,
  Play
} from 'lucide-react';
import { exportAllDataToJSON, downloadFile } from '@/lib/exportUtils';
import { EditTemplateDialog } from '@/components/EditTemplateDialog';
import { ImportTemplateDialog } from '@/components/ImportTemplateDialog';
import { PlaybookTopicDialog } from '@/components/PlaybookTopicDialog';
import type { Template, PlaybookTopic } from '@/types';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const { 
    columns,
    toggleColumn,
    resetColumns,
    addCustomColumn,
    templates,
    createTemplate,
    deleteTemplate,
    updateTemplate,
    addClauseToTemplate,
    updateTemplateClause,
    deleteTemplateClause,
    contracts,
    clearAllData,
    resetToSampleData,
    impactCategories,
    addImpactCategory,
    deleteImpactCategory,
    addSubcategory,
    removeSubcategory,
    resetImpactCategories,
    // Playbook
    playbookTopics,
    playbookCategories,
    createPlaybookTopic,
    updatePlaybookTopic,
    deletePlaybookTopic,
  } = useNegotiation();

  const { hideHelpWidget, setHideHelpWidget, startTour } = useOnboarding();
  const { theme, toggleTheme } = useTheme();

  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDesc, setNewTemplateDesc] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSubcategories, setNewSubcategories] = useState<Record<string, string>>({});
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  
  // Playbook editing state
  const [editingPlaybookTopic, setEditingPlaybookTopic] = useState<PlaybookTopic | null>(null);
  const [showNewTopicDialog, setShowNewTopicDialog] = useState(false);
  const [expandedPlaybookCategories, setExpandedPlaybookCategories] = useState<string[]>([]);
  const [expandedPlaybookTopics, setExpandedPlaybookTopics] = useState<string[]>([]);

  useEscapeKey(onClose, open);

  const handleAddColumn = () => {
    if (!newColumnName.trim()) return;
    addCustomColumn(newColumnName.trim());
    setNewColumnName('');
  };

  const handleCreateTemplate = () => {
    if (!newTemplateName.trim()) return;
    createTemplate({
      name: newTemplateName.trim(),
      description: newTemplateDesc.trim(),
    });
    setNewTemplateName('');
    setNewTemplateDesc('');
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    addImpactCategory(newCategoryName.trim(), []);
    setNewCategoryName('');
  };

  const handleAddSubcategory = (categoryId: string) => {
    const subcategoryName = newSubcategories[categoryId]?.trim();
    if (!subcategoryName) return;
    addSubcategory(categoryId, subcategoryName);
    setNewSubcategories(prev => ({ ...prev, [categoryId]: '' }));
  };

  const toggleCategoryExpanded = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleExportAll = () => {
    const json = exportAllDataToJSON(contracts, templates);
    downloadFile(json, `negotiation-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`, 'application/json');
  };

  const handleClearData = () => {
    clearAllData();
    setShowClearConfirm(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Settings</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="appearance" className="flex-1 flex flex-col min-h-0">
            <TabsList className="flex-shrink-0 w-full flex">
              <TabsTrigger value="appearance" className="flex-1 flex items-center justify-center gap-1">
                <Palette className="w-3.5 h-3.5" />
                Appearance
              </TabsTrigger>
              <TabsTrigger value="columns" className="flex-1 flex items-center justify-center gap-1">
                <Columns className="w-3.5 h-3.5" />
                Columns
              </TabsTrigger>
              <TabsTrigger value="categories" className="flex-1 flex items-center justify-center gap-1">
                <Tags className="w-3.5 h-3.5" />
                Categories
              </TabsTrigger>
              <TabsTrigger value="playbook" className="flex-1 flex items-center justify-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                Playbook
              </TabsTrigger>
              <TabsTrigger value="templates" className="flex-1 flex items-center justify-center gap-1">
                <FileText className="w-3.5 h-3.5" />
                Templates
              </TabsTrigger>
              <TabsTrigger value="data" className="flex-1 flex items-center justify-center gap-1">
                <Database className="w-3.5 h-3.5" />
                Data
              </TabsTrigger>
            </TabsList>

            {/* Appearance Tab */}
            <TabsContent value="appearance" className="flex-1 min-h-0 mt-4">
              <ScrollArea className="h-[400px]">
                <div className="space-y-6 pr-4">
                  <div>
                    <h4 className="font-medium mb-2">Theme</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Choose between light and dark mode for the interface.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => theme === 'dark' && toggleTheme?.()}
                        className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                          theme === 'light'
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-muted-foreground/50'
                        }`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Sun className="w-8 h-8" />
                          <span className="font-medium">Light</span>
                        </div>
                      </button>
                      <button
                        onClick={() => theme === 'light' && toggleTheme?.()}
                        className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                          theme === 'dark'
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-muted-foreground/50'
                        }`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Moon className="w-8 h-8" />
                          <span className="font-medium">Dark</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Help Widget</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Show or hide the floating help button in the bottom-right corner.
                    </p>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <HelpCircle className="w-5 h-5 text-muted-foreground" />
                        <span className="font-medium">Show Help Widget</span>
                      </div>
                      <Switch
                        checked={!hideHelpWidget}
                        onCheckedChange={(checked) => setHideHelpWidget(!checked)}
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Guided Tour</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Take a quick tour of the main features and navigation.
                    </p>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        onClose();
                        // Small delay to allow modal to close before tour starts
                        setTimeout(() => startTour(), 300);
                      }}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Restart Guided Tour
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Columns Tab */}
            <TabsContent value="columns" className="flex-1 min-h-0 mt-4">
              <ScrollArea className="h-[400px]">
                <div className="space-y-4 pr-4">
                  <p className="text-sm text-muted-foreground">
                    Show or hide columns in the clause table. Drag to reorder.
                  </p>

                  <div className="space-y-2">
                    {columns
                      .sort((a, b) => a.order - b.order)
                      .map(column => (
                        <div 
                          key={column.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                            <span className="font-medium">{column.label}</span>
                            {column.id.startsWith('custom-') && (
                              <span className="text-xs text-muted-foreground">(Custom)</span>
                            )}
                          </div>
                          <Switch
                            checked={column.visible}
                            onCheckedChange={() => toggleColumn(column.id)}
                          />
                        </div>
                      ))}
                  </div>

                  <div className="pt-4 border-t">
                    <Label className="text-sm font-medium">Add Custom Column</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        placeholder="Column name"
                        value={newColumnName}
                        onChange={e => setNewColumnName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddColumn()}
                      />
                      <Button onClick={handleAddColumn} disabled={!newColumnName.trim()}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>

                  <Button variant="outline" onClick={resetColumns} className="w-full">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset to Default
                  </Button>
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Categories Tab */}
            <TabsContent value="categories" className="flex-1 min-h-0 mt-4">
              <ScrollArea className="h-[400px]">
                <div className="space-y-4 pr-4">
                  <p className="text-sm text-muted-foreground">
                    Manage impact categories and their subcategories for clause classification.
                  </p>

                  <div className="space-y-2">
                    {impactCategories.map(category => (
                      <Collapsible 
                        key={category.id}
                        open={expandedCategories.includes(category.id)}
                        onOpenChange={() => toggleCategoryExpanded(category.id)}
                      >
                        <div className="border rounded-lg">
                          <CollapsibleTrigger asChild>
                            <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                              <div className="flex items-center gap-2">
                                <ChevronDown className={`w-4 h-4 transition-transform ${expandedCategories.includes(category.id) ? '' : '-rotate-90'}`} />
                                <span className="font-medium">{category.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  ({category.subcategories.length} subcategories)
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteImpactCategory(category.id);
                                }}
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="px-3 pb-3 pt-1 border-t bg-muted/30">
                              <div className="space-y-2">
                                {category.subcategories.map(sub => (
                                  <div 
                                    key={sub}
                                    className="flex items-center justify-between py-1.5 px-2 bg-background rounded"
                                  >
                                    <span className="text-sm">{sub}</span>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => removeSubcategory(category.id, sub)}
                                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </div>
                                ))}
                                {category.subcategories.length === 0 && (
                                  <p className="text-xs text-muted-foreground py-2">
                                    No subcategories yet
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-3">
                                <Input
                                  placeholder="Add subcategory..."
                                  value={newSubcategories[category.id] || ''}
                                  onChange={e => setNewSubcategories(prev => ({ 
                                    ...prev, 
                                    [category.id]: e.target.value 
                                  }))}
                                  onKeyDown={e => e.key === 'Enter' && handleAddSubcategory(category.id)}
                                  className="h-8 text-sm"
                                />
                                <Button 
                                  size="sm"
                                  onClick={() => handleAddSubcategory(category.id)}
                                  disabled={!newSubcategories[category.id]?.trim()}
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
                    ))}
                  </div>

                  <div className="pt-4 border-t">
                    <Label className="text-sm font-medium">Add New Category</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        placeholder="Category name"
                        value={newCategoryName}
                        onChange={e => setNewCategoryName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
                      />
                      <Button onClick={handleAddCategory} disabled={!newCategoryName.trim()}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>

                  <Button variant="outline" onClick={resetImpactCategories} className="w-full">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset to Default
                  </Button>
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Playbook Tab */}
            <TabsContent value="playbook" className="flex-1 min-h-0 mt-4">
              <ScrollArea className="h-[400px]">
                <div className="space-y-4 pr-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Manage negotiation guidance topics with positions, fallbacks, and red lines.
                    </p>
                    <Button size="sm" onClick={() => setShowNewTopicDialog(true)}>
                      <Plus className="w-4 h-4 mr-1" />
                      Add Topic
                    </Button>
                  </div>

                  {playbookCategories.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No playbook topics yet</p>
                      <p className="text-sm">Add negotiation guidance to help with clause negotiations</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {playbookCategories.map(category => {
                        const categoryTopics = playbookTopics.filter(t => t.category === category);
                        const isExpanded = expandedPlaybookCategories.includes(category);
                        
                        return (
                          <Collapsible
                            key={category}
                            open={isExpanded}
                            onOpenChange={(open) => {
                              setExpandedPlaybookCategories(prev =>
                                open
                                  ? [...prev, category]
                                  : prev.filter(c => c !== category)
                              );
                            }}
                          >
                            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                              <div className="flex items-center gap-2">
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                )}
                                <span className="font-medium">{category}</span>
                                <span className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded-full">
                                  {categoryTopics.length} {categoryTopics.length === 1 ? 'topic' : 'topics'}
                                </span>
                              </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="pt-2 pl-6 space-y-2">
                              {categoryTopics.map(topic => {
                                const isTopicExpanded = expandedPlaybookTopics.includes(topic.id);
                                return (
                                  <Collapsible
                                    key={topic.id}
                                    open={isTopicExpanded}
                                    onOpenChange={(open) => {
                                      setExpandedPlaybookTopics(prev =>
                                        open
                                          ? [...prev, topic.id]
                                          : prev.filter(id => id !== topic.id)
                                      );
                                    }}
                                  >
                                    <div className="bg-background border rounded-lg overflow-hidden">
                                      <CollapsibleTrigger className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors text-left">
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                          {isTopicExpanded ? (
                                            <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                          ) : (
                                            <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                          )}
                                          <div className="flex-1 min-w-0">
                                            <div className="font-medium truncate">{topic.title}</div>
                                            <div className="text-xs text-muted-foreground truncate">
                                              {topic.positions.length} positions • {topic.commonObjections.length} objections
                                            </div>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setEditingPlaybookTopic(topic);
                                            }}
                                          >
                                            <Pencil className="w-4 h-4" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive hover:text-destructive"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              deletePlaybookTopic(topic.id);
                                            }}
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </Button>
                                        </div>
                                      </CollapsibleTrigger>
                                      <CollapsibleContent className="border-t bg-muted/30 p-3 space-y-3">
                                        {/* Positions */}
                                        {topic.positions.map((pos, posIdx) => (
                                          <div key={pos.id} className="space-y-2">
                                            {/* Position */}
                                            <div>
                                              <div className="text-xs font-medium text-muted-foreground mb-1">
                                                {posIdx === 0 ? 'Our Position' : `Position ${posIdx + 1}`}
                                              </div>
                                              <div className="text-sm bg-background p-2 rounded border">
                                                {pos.position}
                                              </div>
                                              {pos.proposedChange && (
                                                <div className="text-xs text-muted-foreground mt-1 italic">
                                                  {pos.proposedChange}
                                                </div>
                                              )}
                                            </div>
                                            {/* Fallback */}
                                            {pos.fallback && (
                                              <div>
                                                <div className="text-xs font-medium text-muted-foreground mb-1">Fallback</div>
                                                <div className="text-sm bg-amber-50 dark:bg-amber-900/20 p-2 rounded border border-amber-200 dark:border-amber-800">
                                                  {pos.fallback}
                                                </div>
                                              </div>
                                            )}
                                            {/* Red Line */}
                                            {pos.redline && (
                                              <div>
                                                <div className="text-xs font-medium text-red-600 mb-1">Red Line</div>
                                                <div className="text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-200 dark:border-red-800">
                                                  {pos.redline}
                                                </div>
                                              </div>
                                            )}
                                            {posIdx < topic.positions.length - 1 && (
                                              <hr className="my-2 border-border" />
                                            )}
                                          </div>
                                        ))}
                                        {topic.positions.length === 0 && (
                                          <div className="text-sm text-muted-foreground italic">No positions defined</div>
                                        )}
                                        {/* Common Objections */}
                                        {topic.commonObjections.length > 0 && (
                                          <div>
                                            <div className="text-xs font-medium text-muted-foreground mb-1">Common Objections</div>
                                            <ul className="text-sm space-y-1">
                                              {topic.commonObjections.slice(0, 3).map((objection, idx) => (
                                                <li key={idx} className="flex gap-2">
                                                  <span className="text-muted-foreground">•</span>
                                                  <span className="line-clamp-1">{objection}</span>
                                                </li>
                                              ))}
                                              {topic.commonObjections.length > 3 && (
                                                <li className="text-xs text-muted-foreground">
                                                  + {topic.commonObjections.length - 3} more objections
                                                </li>
                                              )}
                                            </ul>
                                          </div>
                                        )}
                                      </CollapsibleContent>
                                    </div>
                                  </Collapsible>
                                );
                              })}
                            </CollapsibleContent>
                          </Collapsible>
                        );
                      })}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Templates Tab */}
            <TabsContent value="templates" className="flex-1 min-h-0 mt-4">
              <ScrollArea className="h-[400px]">
                <div className="space-y-4 pr-4">
                  <p className="text-sm text-muted-foreground">
                    Create reusable templates with pre-defined clauses for new contracts.
                  </p>

                  {templates.length > 0 && (
                    <div className="space-y-2">
                      {templates.map(template => (
                        <div 
                          key={template.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <h4 className="font-medium">{template.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {template.clauses.length} clauses
                              {template.description && ` • ${template.description}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingTemplate(template)}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteTemplate(template.id)}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-4 border-t space-y-3">
                    <Label className="text-sm font-medium">Create New Template</Label>
                    <Input
                      placeholder="Template name"
                      value={newTemplateName}
                      onChange={e => setNewTemplateName(e.target.value)}
                    />
                    <Textarea
                      placeholder="Description (optional)"
                      value={newTemplateDesc}
                      onChange={e => setNewTemplateDesc(e.target.value)}
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleCreateTemplate} 
                        disabled={!newTemplateName.trim()}
                        className="flex-1"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Template
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => setShowImportDialog(true)}
                        className="flex-1"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Import from File
                      </Button>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Data Tab */}
            <TabsContent value="data" className="flex-1 min-h-0 mt-4">
              <ScrollArea className="h-[400px]">
                <div className="space-y-6 pr-4">
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <HelpCircle className="w-4 h-4" />
                      Preferences
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">Feature Discovery Widget</p>
                          <p className="text-xs text-muted-foreground">
                            Show the floating help button with feature tips
                          </p>
                        </div>
                        <Switch
                          checked={!hideHelpWidget}
                          onCheckedChange={(checked) => setHideHelpWidget(!checked)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Export Data</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Download all your contracts and data as a JSON backup file.
                    </p>
                    <Button variant="outline" onClick={handleExportAll}>
                      <Download className="w-4 h-4 mr-2" />
                      Export All Data
                    </Button>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Reset Data</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Restore the sample contracts and data for demonstration purposes.
                    </p>
                    <Button variant="outline" onClick={resetToSampleData}>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset to Sample Data
                    </Button>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2 text-destructive">Danger Zone</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Permanently delete all contracts, clauses, and settings. This cannot be undone.
                    </p>
                    <Button 
                      variant="destructive" 
                      onClick={() => setShowClearConfirm(true)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear All Data
                    </Button>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Storage Info</h4>
                    <p className="text-sm text-muted-foreground">
                      Data is stored locally in your browser's localStorage. 
                      Export regularly to prevent data loss if you clear your browser cache.
                    </p>
                    <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm">
                        <span className="font-medium">{contracts.length}</span> contracts stored
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">{templates.length}</span> templates stored
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Clear Data Confirmation */}
      <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all contracts, clauses, templates, and settings. 
              This action cannot be undone. Consider exporting your data first.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleClearData}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Clear All Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Template Dialog */}
      <EditTemplateDialog
        open={!!editingTemplate}
        onOpenChange={(open) => !open && setEditingTemplate(null)}
        template={editingTemplate}
        onSave={updateTemplate}
        onAddClause={addClauseToTemplate}
        onUpdateClause={updateTemplateClause}
        onDeleteClause={deleteTemplateClause}
      />

      {/* Import Template Dialog */}
      <ImportTemplateDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        onImport={(templateData) => {
          createTemplate({
            name: templateData.name,
            description: templateData.description,
            clauses: templateData.clauses,
          });
        }}
      />

      {/* Playbook Topic Dialog */}
      <PlaybookTopicDialog
        open={showNewTopicDialog || !!editingPlaybookTopic}
        onOpenChange={(open) => {
          if (!open) {
            setShowNewTopicDialog(false);
            setEditingPlaybookTopic(null);
          }
        }}
        topic={editingPlaybookTopic}
        existingCategories={playbookCategories}
        onSave={(topicData) => {
          if ('id' in topicData) {
            updatePlaybookTopic(topicData.id, topicData);
          } else {
            createPlaybookTopic(topicData);
          }
        }}
      />
    </>
  );
}
