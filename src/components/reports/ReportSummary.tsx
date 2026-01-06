import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Metric { label: string; value: number; previousValue?: number; format?: 'number' | 'percent' | 'currency'; description?: string; }
interface SummarySection { title: string; metrics: Metric[]; }

export function ReportSummary({ sections, title = 'Report Summary', className }: { sections: SummarySection[]; title?: string; className?: string }) {
  const formatValue = (value: number, format?: string) => {
    switch (format) {
      case 'percent': return `${value.toFixed(1)}%`;
      case 'currency': return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(value);
      default: return new Intl.NumberFormat('en-US', { notation: 'compact' }).format(value);
    }
  };

  const getChange = (current: number, previous?: number) => {
    if (previous === undefined) return null;
    const change = ((current - previous) / previous) * 100;
    return { value: change, trend: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral' as const };
  };

  return (
    <Card className={className}>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent>
        <Tabs defaultValue={sections[0]?.title}>
          <TabsList className="w-full justify-start">{sections.map(s => <TabsTrigger key={s.title} value={s.title}>{s.title}</TabsTrigger>)}</TabsList>
          {sections.map(section => (
            <TabsContent key={section.title} value={section.title} className="mt-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {section.metrics.map((metric, i) => {
                  const change = getChange(metric.value, metric.previousValue);
                  return (
                    <div key={i} className="p-4 rounded-lg border">
                      <div className="flex items-start justify-between">
                        <p className="text-sm text-muted-foreground">{metric.label}</p>
                        {metric.description && <Info className="h-4 w-4 text-muted-foreground cursor-help" title={metric.description} />}
                      </div>
                      <p className="text-2xl font-bold mt-1">{formatValue(metric.value, metric.format)}</p>
                      {change && (
                        <div className={cn('flex items-center gap-1 mt-1 text-sm', change.trend === 'up' ? 'text-green-600' : change.trend === 'down' ? 'text-red-600' : 'text-muted-foreground')}>
                          {change.trend === 'up' ? <TrendingUp className="h-4 w-4" /> : change.trend === 'down' ? <TrendingDown className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                          <span>{change.value > 0 ? '+' : ''}{change.value.toFixed(1)}%</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
export default ReportSummary;
