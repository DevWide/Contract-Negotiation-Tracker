// Contract Negotiation Tracker - Timeline Component
// Design: Refined Legal Elegance - Horizontal timeline visualization with clickable events

import { useState } from 'react';
import { useNegotiation } from '@/contexts/NegotiationContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Trash2, 
  Calendar,
  FileText,
  Send,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  Clock,
  Users,
  Edit,
  StickyNote
} from 'lucide-react';
import type { TimelineEvent } from '@/types';

const eventTypes = [
  { value: 'Created', icon: FileText, color: 'bg-[oklch(0.45_0.08_160)]' },
  { value: 'Sent', icon: Send, color: 'bg-[oklch(0.50_0.06_280)]' },
  { value: 'Received', icon: MessageSquare, color: 'bg-[oklch(0.45_0.08_160)]' },
  { value: 'Meeting', icon: Users, color: 'bg-[oklch(0.55_0.12_45)]' },
  { value: 'Review', icon: Clock, color: 'bg-[oklch(0.55_0.15_55)]' },
  { value: 'Escalated', icon: AlertTriangle, color: 'bg-[oklch(0.55_0.15_55)]' },
  { value: 'Agreed', icon: CheckCircle, color: 'bg-[oklch(0.45_0.08_160)]' },
  { value: 'Signed', icon: FileText, color: 'bg-[oklch(0.45_0.08_160)]' },
];

export function Timeline() {
  const { activeContract, addTimelineEvent, updateTimelineEvent, deleteTimelineEvent, completeContract, archiveContract } = useNegotiation();
  const { markFeatureDiscovered } = useOnboarding();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newEvent, setNewEvent] = useState({
    type: 'Meeting',
    description: '',
    date: new Date().toISOString().slice(0, 10),
    notes: '',
  });
  const [editEvent, setEditEvent] = useState({
    type: '',
    description: '',
    date: '',
    notes: '',
  });

  if (!activeContract) return null;

  const timeline = activeContract.timeline || [];

  const handleAddEvent = () => {
    if (!newEvent.description.trim()) return;
    
    const isSigned = newEvent.type === 'Signed';
    
    addTimelineEvent(activeContract.id, {
      type: newEvent.type,
      description: newEvent.description.trim(),
      date: newEvent.date,
      notes: newEvent.notes.trim() || undefined,
    });
    // Track feature discovery
    markFeatureDiscovered('add-timeline-note');
    setNewEvent({
      type: 'Meeting',
      description: '',
      date: new Date().toISOString().slice(0, 10),
      notes: '',
    });
    setShowAddDialog(false);
    
    // Show completion dialog if event type is "Signed"
    if (isSigned && activeContract.status === 'active') {
      setShowCompletionDialog(true);
    }
  };

  const handleMarkAsCompleted = () => {
    completeContract(activeContract.id);
    setShowCompletionDialog(false);
  };

  const handleArchiveContract = () => {
    archiveContract(activeContract.id);
    setShowCompletionDialog(false);
  };

  const handleEventClick = (event: TimelineEvent) => {
    setSelectedEvent(event);
    setEditEvent({
      type: event.type,
      description: event.description,
      date: event.date,
      notes: event.notes || '',
    });
    setIsEditing(false);
    setShowViewDialog(true);
  };

  const handleSaveEdit = () => {
    if (!selectedEvent || !editEvent.description.trim()) return;
    updateTimelineEvent(activeContract.id, selectedEvent.id, {
      type: editEvent.type,
      description: editEvent.description.trim(),
      date: editEvent.date,
      notes: editEvent.notes.trim() || undefined,
    });
    setIsEditing(false);
    setShowViewDialog(false);
  };

  const handleDeleteEvent = (eventId: number) => {
    deleteTimelineEvent(activeContract.id, eventId);
    setShowViewDialog(false);
  };

  const getEventIcon = (type: string) => {
    const eventType = eventTypes.find(e => e.value === type);
    return eventType?.icon || Calendar;
  };

  const getEventColor = (type: string) => {
    const eventType = eventTypes.find(e => e.value === type);
    return eventType?.color || 'bg-muted';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatFullDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="font-serif text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[oklch(0.55_0.12_45)]" />
            Negotiation Timeline
          </CardTitle>
          <Button size="sm" onClick={() => setShowAddDialog(true)} data-tour="add-timeline">
            <Plus className="w-4 h-4 mr-1" />
            Add Event
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {timeline.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No timeline events yet</p>
            <p className="text-sm">Add milestones to track the negotiation journey</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute top-6 left-0 right-0 h-0.5 bg-border" />
            
            {/* Events */}
            <div className="flex overflow-x-auto pb-4 gap-0">
              {timeline.map((event, index) => {
                const Icon = getEventIcon(event.type);
                const colorClass = getEventColor(event.type);
                
                return (
                  <div 
                    key={event.id} 
                    className="relative flex flex-col items-center min-w-[140px] group cursor-pointer"
                    onClick={() => handleEventClick(event)}
                  >
                    {/* Date */}
                    <div className="text-xs text-muted-foreground mb-2">
                      {formatDate(event.date)}
                    </div>
                    
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-full ${colorClass} flex items-center justify-center z-10 shadow-sm transition-transform hover:scale-110`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    
                    {/* Content */}
                    <div className="mt-3 text-center px-2">
                      <p className="text-sm font-medium">{event.type}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {event.description}
                      </p>
                      {event.notes && (
                        <div className="flex items-center justify-center gap-1 mt-1 text-xs text-muted-foreground">
                          <StickyNote className="w-3 h-3" />
                          <span>Has notes</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Connector line to next */}
                    {index < timeline.length - 1 && (
                      <div className="absolute top-6 left-1/2 w-full h-0.5 bg-border" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>

      {/* Add Event Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Add Timeline Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Event Type</Label>
              <Select
                value={newEvent.type}
                onValueChange={value => setNewEvent(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <span className="flex items-center gap-2">
                        <type.icon className="w-4 h-4" />
                        {type.value}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={newEvent.date}
                onChange={e => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                placeholder="Brief description of the event..."
                value={newEvent.description}
                onChange={e => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea
                placeholder="Additional notes or details..."
                value={newEvent.notes}
                onChange={e => setNewEvent(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddEvent}
              disabled={!newEvent.description.trim()}
              className="bg-[oklch(0.45_0.08_160)] hover:bg-[oklch(0.50_0.08_160)]"
            >
              Add Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View/Edit Event Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="font-serif flex items-center gap-2">
              {selectedEvent && (
                <>
                  {(() => {
                    const Icon = getEventIcon(selectedEvent.type);
                    return <Icon className="w-5 h-5" />;
                  })()}
                  {isEditing ? 'Edit Event' : 'Event Details'}
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedEvent && !isEditing && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full ${getEventColor(selectedEvent.type)} flex items-center justify-center`}>
                  {(() => {
                    const Icon = getEventIcon(selectedEvent.type);
                    return <Icon className="w-6 h-6 text-white" />;
                  })()}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{selectedEvent.type}</h3>
                  <p className="text-sm text-muted-foreground">{formatFullDate(selectedEvent.date)}</p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <Label className="text-xs uppercase text-muted-foreground">Description</Label>
                <p className="mt-1">{selectedEvent.description}</p>
              </div>
              
              {selectedEvent.notes && (
                <div>
                  <Label className="text-xs uppercase text-muted-foreground flex items-center gap-1">
                    <StickyNote className="w-3 h-3" />
                    Notes
                  </Label>
                  <p className="mt-1 text-sm bg-muted/50 p-3 rounded-md whitespace-pre-wrap">
                    {selectedEvent.notes}
                  </p>
                </div>
              )}
              
              <div className="text-xs text-muted-foreground">
                Created: {new Date(selectedEvent.timestamp).toLocaleString()}
              </div>
            </div>
          )}
          
          {selectedEvent && isEditing && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Event Type</Label>
                <Select
                  value={editEvent.type}
                  onValueChange={value => setEditEvent(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <span className="flex items-center gap-2">
                          <type.icon className="w-4 h-4" />
                          {type.value}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={editEvent.date}
                  onChange={e => setEditEvent(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={editEvent.description}
                  onChange={e => setEditEvent(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  placeholder="Additional notes or details..."
                  value={editEvent.notes}
                  onChange={e => setEditEvent(prev => ({ ...prev, notes: e.target.value }))}
                  rows={4}
                />
              </div>
            </div>
          )}
          
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => selectedEvent && handleDeleteEvent(selectedEvent.id)}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSaveEdit}
                    disabled={!editEvent.description.trim()}
                    className="bg-[oklch(0.45_0.08_160)] hover:bg-[oklch(0.50_0.08_160)]"
                  >
                    Save Changes
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={() => setShowViewDialog(false)}>
                    Close
                  </Button>
                  <Button onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contract Completion Dialog */}
      <Dialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="font-serif flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-[oklch(0.45_0.08_160)]" />
              Contract Signed!
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground mb-4">
              Congratulations! The contract has been signed. Would you like to update its status?
            </p>
            <div className="space-y-3">
              <Button 
                onClick={handleMarkAsCompleted}
                className="w-full justify-start bg-[oklch(0.45_0.08_160)] hover:bg-[oklch(0.50_0.08_160)]"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark as Completed
                <span className="text-xs text-white/70 ml-auto">Keep visible in dashboard</span>
              </Button>
              <Button 
                onClick={handleArchiveContract}
                variant="outline"
                className="w-full justify-start"
              >
                <FileText className="w-4 h-4 mr-2" />
                Archive Contract
                <span className="text-xs text-muted-foreground ml-auto">Move to archives</span>
              </Button>
              <Button 
                onClick={() => setShowCompletionDialog(false)}
                variant="ghost"
                className="w-full justify-start"
              >
                Keep Active
                <span className="text-xs text-muted-foreground ml-auto">Continue working</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
