import { TrendingUp, TrendingDown, Users, Activity, AlertTriangle, BarChart2 } from 'lucide-react';
import { Card, CardContent } from './ui/Card';
import { cn } from '@/utils/cn';

interface StatCardProps { title: string; value: string | number; icon?: string; trend?: number; }

const icons: Record<string, typeof Users> = { users: Users, activity: Activity, 'alert-triangle': AlertTriangle, 'trending-up': BarChart2 };

export const StatCard = ({ title, value, icon, trend }: StatCardProps) => {
  const Icon = icon ? icons[icon] || BarChart2 : BarChart2;
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {trend !== undefined && (
              <div className={cn('flex items-center text-sm mt-1', trend >= 0 ? 'text-green-500' : 'text-red-500')}>
                {trend >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                {Math.abs(trend)}%
              </div>
            )}
          </div>
          <Icon className="h-10 w-10 text-muted-foreground/50" />
        </div>
      </CardContent>
    </Card>
  );
};