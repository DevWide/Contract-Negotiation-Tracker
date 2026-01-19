// Contract Negotiation Tracker - DashboardStats Component
// Design: Refined Legal Elegance - Summary statistics cards

import { useMemo } from 'react';
import { useNegotiation } from '@/contexts/NegotiationContext';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  CheckCircle2, 
  MessageSquare, 
  AlertTriangle,
  AlertOctagon,
  Minus
} from 'lucide-react';

export function DashboardStats() {
  const { activeContract } = useNegotiation();

  const stats = useMemo(() => {
    if (!activeContract) {
      return {
        total: 0,
        byStatus: {
          'No Changes': 0,
          'In Discussion': 0,
          'Agreed': 0,
          'Escalated': 0,
          'Blocked': 0,
        },
        byPriority: { Low: 0, Medium: 0, High: 0 },
        completionRate: 0,
      };
    }

    const items = activeContract.items;
    const total = items.length;

    const byStatus = items.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byPriority = items.reduce((acc, item) => {
      acc[item.priority] = (acc[item.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const resolved = (byStatus['Agreed'] || 0) + (byStatus['No Changes'] || 0);
    const completionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    return {
      total,
      byStatus: {
        'No Changes': byStatus['No Changes'] || 0,
        'In Discussion': byStatus['In Discussion'] || 0,
        'Agreed': byStatus['Agreed'] || 0,
        'Escalated': byStatus['Escalated'] || 0,
        'Blocked': byStatus['Blocked'] || 0,
      },
      byPriority: {
        Low: byPriority['Low'] || 0,
        Medium: byPriority['Medium'] || 0,
        High: byPriority['High'] || 0,
      },
      completionRate,
    };
  }, [activeContract]);

  if (!activeContract) return null;

  const statusCards = [
    { 
      label: 'Total Clauses', 
      value: stats.total, 
      icon: FileText,
      color: 'text-[oklch(0.25_0.05_250)]',
      bgColor: 'bg-[oklch(0.94_0.02_250)]',
    },
    { 
      label: 'Agreed', 
      value: stats.byStatus['Agreed'], 
      icon: CheckCircle2,
      color: 'text-[oklch(0.35_0.10_145)]',
      bgColor: 'bg-[oklch(0.92_0.06_145)]',
    },
    { 
      label: 'In Discussion', 
      value: stats.byStatus['In Discussion'], 
      icon: MessageSquare,
      color: 'text-[oklch(0.40_0.08_240)]',
      bgColor: 'bg-[oklch(0.92_0.05_240)]',
    },
    { 
      label: 'Escalated', 
      value: stats.byStatus['Escalated'], 
      icon: AlertTriangle,
      color: 'text-[oklch(0.45_0.12_55)]',
      bgColor: 'bg-[oklch(0.92_0.06_55)]',
    },
    { 
      label: 'Blocked', 
      value: stats.byStatus['Blocked'], 
      icon: AlertOctagon,
      color: 'text-[oklch(0.40_0.12_15)]',
      bgColor: 'bg-[oklch(0.92_0.06_15)]',
    },
    { 
      label: 'No Changes', 
      value: stats.byStatus['No Changes'], 
      icon: Minus,
      color: 'text-[oklch(0.45_0.02_250)]',
      bgColor: 'bg-[oklch(0.94_0.01_250)]',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {statusCards.map(({ label, value, icon: Icon, color, bgColor }) => (
          <Card key={label} className="border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <p className="text-2xl font-semibold font-serif">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress & Priority Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Completion Progress */}
        <Card className="border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium">Completion Progress</h4>
              <span className="text-2xl font-serif font-semibold text-[oklch(0.45_0.12_145)]">
                {stats.completionRate}%
              </span>
            </div>
            <Progress value={stats.completionRate} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {stats.byStatus['Agreed'] + stats.byStatus['No Changes']} of {stats.total} clauses resolved
            </p>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card className="border shadow-sm">
          <CardContent className="p-4">
            <h4 className="text-sm font-medium mb-3">Priority Distribution</h4>
            <div className="flex items-center gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[oklch(0.40_0.12_15)]" />
                    High
                  </span>
                  <span className="font-medium">{stats.byPriority.High}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[oklch(0.55_0.15_55)]" />
                    Medium
                  </span>
                  <span className="font-medium">{stats.byPriority.Medium}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[oklch(0.45_0.12_145)]" />
                    Low
                  </span>
                  <span className="font-medium">{stats.byPriority.Low}</span>
                </div>
              </div>
              <div className="w-24 h-24 relative">
                {stats.total > 0 ? (
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    {(() => {
                      const total = stats.total;
                      const high = stats.byPriority.High / total;
                      const medium = stats.byPriority.Medium / total;
                      const low = stats.byPriority.Low / total;
                      
                      let offset = 0;
                      const segments = [];
                      
                      if (high > 0) {
                        segments.push(
                          <circle
                            key="high"
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke="oklch(0.40 0.12 15)"
                            strokeWidth="20"
                            strokeDasharray={`${high * 251.2} 251.2`}
                            strokeDashoffset={-offset * 251.2}
                          />
                        );
                        offset += high;
                      }
                      
                      if (medium > 0) {
                        segments.push(
                          <circle
                            key="medium"
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke="oklch(0.55 0.15 55)"
                            strokeWidth="20"
                            strokeDasharray={`${medium * 251.2} 251.2`}
                            strokeDashoffset={-offset * 251.2}
                          />
                        );
                        offset += medium;
                      }
                      
                      if (low > 0) {
                        segments.push(
                          <circle
                            key="low"
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke="oklch(0.45 0.12 145)"
                            strokeWidth="20"
                            strokeDasharray={`${low * 251.2} 251.2`}
                            strokeDashoffset={-offset * 251.2}
                          />
                        );
                      }
                      
                      return segments;
                    })()}
                  </svg>
                ) : (
                  <div className="w-full h-full rounded-full border-8 border-muted" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
