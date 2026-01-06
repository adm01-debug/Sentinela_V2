import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Target, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface Goal { id: string; name: string; current: number; target: number; unit?: string; dueDate?: Date; status?: 'on-track' | 'at-risk' | 'completed'; }

export function GoalProgressWidget({ goals, className }: { goals: Goal[]; className?: string }) {
  const statusIcons = { 'on-track': <Clock className="h-4 w-4 text-blue-500" />, 'at-risk': <AlertTriangle className="h-4 w-4 text-yellow-500" />, completed: <CheckCircle className="h-4 w-4 text-green-500" /> };
  const statusColors = { 'on-track': 'text-blue-600', 'at-risk': 'text-yellow-600', completed: 'text-green-600' };

  return (
    <Card className={className}>
      <CardHeader><CardTitle className="flex items-center gap-2"><Target className="h-5 w-5" />Goals Progress</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {goals.map(goal => {
          const progress = Math.min(100, (goal.current / goal.target) * 100);
          return (
            <div key={goal.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{goal.name}</span>
                <div className="flex items-center gap-2">{goal.status && statusIcons[goal.status]}<span className={cn('text-sm', goal.status && statusColors[goal.status])}>{goal.current}/{goal.target} {goal.unit}</span></div>
              </div>
              <Progress value={progress} className="h-2" />
              {goal.dueDate && <p className="text-xs text-muted-foreground">Due: {goal.dueDate.toLocaleDateString()}</p>}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
export default GoalProgressWidget;
