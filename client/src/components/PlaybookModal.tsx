// Contract Negotiation Tracker - PlaybookModal Component
// Design: Refined Legal Elegance - Modal for viewing playbook filtered by clause topic

import { useState, useMemo } from 'react';
import { useNegotiation } from '@/contexts/NegotiationContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { 
  BookOpen, 
  Search, 
  X,
  AlertTriangle,
  Target,
  Shield,
  Lightbulb,
  Plus,
  Edit,
  Trash2,
  Save
} from 'lucide-react';
import type { ClauseItem, PlaybookTopic, PlaybookPosition } from '@/types';
import { Textarea } from './ui/textarea';

interface PlaybookModalProps {
  item: ClauseItem;
  open: boolean;
  onClose: () => void;
}

export function PlaybookModal({ item, open, onClose }: PlaybookModalProps) {
  const { 
    playbookTopics, 
    playbookCategories,
    searchPlaybookTopics,
    createPlaybookTopic,
    updatePlaybookTopic,
    deletePlaybookTopic,
  } = useNegotiation();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddTopic, setShowAddTopic] = useState(false);
  const [editingTopic, setEditingTopic] = useState<PlaybookTopic | null>(null);
  const [newTopic, setNewTopic] = useState({
    title: '',
    description: '',
    category: '',
    commonObjections: [''],
    positions: [] as PlaybookPosition[],
    relatedClauseTypes: [''],
  });

  // Find relevant topics based on clause's impact category/subcategory or topic
  const relevantTopics = useMemo(() => {
    const searchTerms = [
      item.impactCategory,
      item.impactSubcategory,
      item.topic,
      item.issue,
    ].filter(Boolean).map(t => t?.toLowerCase() || '');

    return playbookTopics.filter(topic => {
      const topicText = `${topic.title} ${topic.description} ${topic.category} ${topic.relatedClauseTypes.join(' ')}`.toLowerCase();
      return searchTerms.some(term => topicText.includes(term));
    });
  }, [playbookTopics, item]);

  // All topics filtered by search
  const filteredTopics = useMemo(() => {
    if (searchQuery.trim()) {
      return searchPlaybookTopics(searchQuery);
    }
    return playbookTopics;
  }, [searchQuery, searchPlaybookTopics, playbookTopics]);

  // Group topics by category
  const topicsByCategory = useMemo(() => {
    const grouped: Record<string, typeof playbookTopics> = {};
    filteredTopics.forEach(topic => {
      if (!grouped[topic.category]) {
        grouped[topic.category] = [];
      }
      grouped[topic.category].push(topic);
    });
    return grouped;
  }, [filteredTopics]);

  const handleAddTopic = () => {
    if (!newTopic.title.trim() || !newTopic.category.trim()) return;
    
    createPlaybookTopic({
      title: newTopic.title,
      description: newTopic.description,
      category: newTopic.category,
      commonObjections: newTopic.commonObjections.filter(o => o.trim()),
      positions: newTopic.positions,
      relatedClauseTypes: newTopic.relatedClauseTypes.filter(t => t.trim()),
    });
    
    setNewTopic({
      title: '',
      description: '',
      category: '',
      commonObjections: [''],
      positions: [],
      relatedClauseTypes: [''],
    });
    setShowAddTopic(false);
  };

  const handleDeleteTopic = (topicId: string) => {
    if (confirm('Are you sure you want to delete this playbook topic?')) {
      deletePlaybookTopic(topicId);
    }
  };

  const renderTopicCard = (topic: PlaybookTopic, isRelevant: boolean = false) => (
    <div key={topic.id} className={`border rounded-lg p-4 ${isRelevant ? 'bg-[oklch(0.93_0.05_45)]/30 border-[oklch(0.70_0.10_75)]' : 'bg-muted/20'}`}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="font-medium">{topic.title}</h4>
          {isRelevant && (
            <Badge variant="outline" className="text-xs mt-1 bg-[oklch(0.93_0.05_45)] text-[oklch(0.40_0.10_75)] border-[oklch(0.70_0.10_75)]">
              Relevant to this clause
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setEditingTopic(topic)}
          >
            <Edit className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={() => handleDeleteTopic(topic.id)}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-3">
        {topic.description}
      </p>

      {/* Common Objections */}
      {topic.commonObjections.length > 0 && (
        <div className="mb-3">
          <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Common Objections
          </h5>
          <ul className="text-sm space-y-1">
            {topic.commonObjections.map((obj, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-[oklch(0.55_0.15_55)] mt-1">•</span>
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Positions */}
      {topic.positions.length > 0 && (
        <div>
          <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
            <Target className="w-3 h-3" />
            Negotiation Positions
          </h5>
          <div className="space-y-3">
            {topic.positions.map(pos => (
              <div key={pos.id} className="bg-background rounded-lg p-3 border">
                <div className="flex items-start gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-[oklch(0.55_0.12_45)] mt-0.5" />
                  <p className="font-medium text-sm">{pos.position}</p>
                </div>
                <p className="text-xs text-muted-foreground mb-2 ml-6">
                  {pos.proposedChange}
                </p>
                {pos.fallback && (
                  <p className="text-xs ml-6 mb-1">
                    <span className="font-medium text-[oklch(0.55_0.15_55)]">
                      Fallback:
                    </span>{' '}
                    {pos.fallback}
                  </p>
                )}
                {pos.redline && (
                  <p className="text-xs ml-6 flex items-start gap-1">
                    <Shield className="w-3 h-3 text-[oklch(0.40_0.12_15)] mt-0.5" />
                    <span>
                      <span className="font-medium text-[oklch(0.40_0.12_15)]">
                        Redline:
                      </span>{' '}
                      {pos.redline}
                    </span>
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related Clause Types */}
      {topic.relatedClauseTypes.length > 0 && (
        <div className="mt-3 pt-3 border-t">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">Related to:</span>{' '}
            {topic.relatedClauseTypes.join(', ')}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0 pb-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="font-serif text-xl flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[oklch(0.55_0.12_45)]" />
              Negotiation Playbook
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddTopic(true)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Topic
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Clause Context */}
          <div className="mt-2 p-3 bg-muted/30 rounded-lg">
            <p className="text-sm">
              <span className="font-medium">Viewing playbook for:</span>{' '}
              <span className="font-mono">{item.clauseNumber}</span> - {item.issue}
            </p>
            <div className="flex items-center gap-2 mt-1">
              {item.impactCategory && (
                <Badge variant="outline" className="text-xs">
                  {item.impactCategory}
                </Badge>
              )}
              {item.impactSubcategory && (
                <Badge variant="outline" className="text-xs">
                  {item.impactSubcategory}
                </Badge>
              )}
              {item.topic && (
                <Badge variant="outline" className="text-xs">
                  {item.topic}
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0">
          <div className="space-y-6 pr-4 pb-6">
            {/* Relevant Topics Section */}
            {relevantTopics.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-[oklch(0.55_0.12_45)]" />
                  Relevant Guidance ({relevantTopics.length})
                </h3>
                <div className="space-y-4">
                  {relevantTopics.map(topic => renderTopicCard(topic, true))}
                </div>
              </div>
            )}

            {relevantTopics.length > 0 && <Separator />}

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search all playbook topics..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* All Topics by Category */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                All Topics
              </h3>
              {Object.keys(topicsByCategory).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No topics found</p>
                </div>
              ) : (
                <Accordion type="multiple" className="space-y-2">
                  {Object.entries(topicsByCategory).map(([category, topics]) => (
                    <AccordionItem key={category} value={category} className="border rounded-lg">
                      <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{category}</span>
                          <Badge variant="secondary" className="text-xs">
                            {topics.length}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <div className="space-y-4">
                          {topics.map(topic => renderTopicCard(topic, relevantTopics.some(r => r.id === topic.id)))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </div>
          </div>
        </ScrollArea>

        {/* Add Topic Dialog */}
        {showAddTopic && (
          <div className="absolute inset-0 bg-background/95 z-10 flex flex-col">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="font-serif text-lg font-semibold">Add New Playbook Topic</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowAddTopic(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-4 max-w-xl">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title *</label>
                  <Input
                    placeholder="e.g., Liability Cap Negotiation"
                    value={newTopic.title}
                    onChange={e => setNewTopic(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category *</label>
                  <Input
                    placeholder="e.g., Legal, Financial, Operational"
                    value={newTopic.category}
                    onChange={e => setNewTopic(prev => ({ ...prev, category: e.target.value }))}
                    list="categories"
                  />
                  <datalist id="categories">
                    {playbookCategories.map(cat => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    placeholder="Describe the topic and when it applies..."
                    value={newTopic.description}
                    onChange={e => setNewTopic(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Common Objections</label>
                  {newTopic.commonObjections.map((obj, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input
                        placeholder="Enter an objection..."
                        value={obj}
                        onChange={e => {
                          const updated = [...newTopic.commonObjections];
                          updated[i] = e.target.value;
                          setNewTopic(prev => ({ ...prev, commonObjections: updated }));
                        }}
                      />
                      {i === newTopic.commonObjections.length - 1 && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setNewTopic(prev => ({ 
                            ...prev, 
                            commonObjections: [...prev.commonObjections, ''] 
                          }))}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Related Clause Types</label>
                  {newTopic.relatedClauseTypes.map((type, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input
                        placeholder="e.g., Liability, Indemnification"
                        value={type}
                        onChange={e => {
                          const updated = [...newTopic.relatedClauseTypes];
                          updated[i] = e.target.value;
                          setNewTopic(prev => ({ ...prev, relatedClauseTypes: updated }));
                        }}
                      />
                      {i === newTopic.relatedClauseTypes.length - 1 && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setNewTopic(prev => ({ 
                            ...prev, 
                            relatedClauseTypes: [...prev.relatedClauseTypes, ''] 
                          }))}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>
            <div className="p-4 border-t flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddTopic(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddTopic}>
                <Save className="w-4 h-4 mr-1" />
                Add Topic
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
