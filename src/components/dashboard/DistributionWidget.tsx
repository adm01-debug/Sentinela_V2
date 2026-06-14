import * as React from 'react';
import { PieChart, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Distribution { label: string; value: number; color: string; }

export function DistributionWidget({ data, title = 'Distribution', type = 'pie', className }: { data: Distribution[]; title?: string; type?: 'pie' | 'bar'; className?: string }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const sorted = [...data].sort((a, b) => b.value - a.value);

  return (
    <Card className={className}>
      <CardHeader><CardTitle className="flex items-center gap-2">{type === 'pie' ? <PieChart className="h-5 w-5" /> : <BarChart3 className="h-5 w-5" />}{title}</CardTitle></CardHeader>
      <CardContent>
        {type === 'pie' ? (
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24">
              <svg viewBox="0 0 36 36" className="w-24 h-24 transform -rotate-90">
                {data.map((item, i) => {
                  const pct = (item.value / total) * 100;
                  const offset = data.slice(0, i).reduce((a, d) => a + (d.value / total) * 100, 0);
                  return <circle key={item.label} cx="18" cy="18" r="15.9" fill="none" stroke={item.color} strokeWidth="3" strokeDasharray={`${pct} 100`} strokeDashoffset={-offset} />;
                })}
              </svg>
            </div>
            <div className="space-y-2 flex-1">
              {sorted.map(item => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm flex-1">{item.label}</span>
                  <span className="text-sm font-medium">{((item.value / total) * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1"><span>{item.label}</span><span className="font-medium">{item.value}</span></div>
                <div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full rounded-full transition-all" style={{ width: `${(item.value / sorted[0].value) * 100}%`, backgroundColor: item.color }} /></div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
export default DistributionWidget;
