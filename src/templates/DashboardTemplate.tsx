import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatCardProps { title: string; value: string | number; description?: string; icon?: React.ReactNode; trend?: { value: number; isPositive: boolean }; }

interface DashboardTemplateProps { title: string; stats: StatCardProps[]; children: React.ReactNode; className?: string; }

export function DashboardTemplate({ title, stats, children, className }: DashboardTemplateProps) {
  return (
    <div className={cn('space-y-6', className)}>
      <h1 className="text-2xl font-bold">{title}</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.description && <p className="text-xs text-muted-foreground">{stat.description}</p>}
            </CardContent>
          </Card>
        ))}
      </div>
      <div>{children}</div>
    </div>
  );
}
