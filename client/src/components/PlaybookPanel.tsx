// Contract Negotiation Tracker - PlaybookPanel Component
// Design: Refined Legal Elegance - Collapsible playbook guidance panel

import { useState, useMemo } from 'react';
import { useNegotiation } from '@/contexts/NegotiationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { 
  BookOpen, 
  Search, 
  ChevronDown, 
  ChevronUp,
  AlertTriangle,
  Target,
  Shield,
  Lightbulb
} from 'lucide-react';

export function PlaybookPanel() {
  const { 
    playbookTopics, 
    playbookCategories, 
    searchPlaybookTopics,
    getTopicsByCategory,
  } = useNegotiation();

  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTopics = useMemo(() => {
    if (searchQuery.trim()) {
      return searchPlaybookTopics(searchQuery);
    }
    return playbookTopics;
  }, [searchQuery, searchPlaybookTopics, playbookTopics]);

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

  return (
    <Card className="border shadow-sm">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CardHeader className="pb-3">
          <CollapsibleTrigger asChild>
            <button className="w-full flex items-center justify-between hover:bg-accent/50 -mx-6 -my-4 px-6 py-4 rounded-t-lg transition-colors">
              <CardTitle className="font-serif text-lg flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[oklch(0.55_0.12_45)]" />
                Negotiation Playbook
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {playbookTopics.length} topics
                </Badge>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            </button>
          </CollapsibleTrigger>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="pt-0">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search playbook..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Topics by Category */}
            <ScrollArea className="h-[400px]">
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
                          {topics.map(topic => (
                            <div key={topic.id} className="border rounded-lg p-4 bg-muted/20">
                              <h4 className="font-medium mb-2">{topic.title}</h4>
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
                                          {pos.rationale}
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
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </ScrollArea>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
