import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface DataCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconColor?: string;
  children: ReactNode;
  className?: string;
  headerActions?: ReactNode;
}

export function DataCard({
  title,
  description,
  icon: Icon,
  iconColor = 'text-primary',
  children,
  className,
  headerActions,
}: DataCardProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          {Icon && (
            <div className="p-2 rounded-lg bg-muted">
              <Icon className={cn('h-4 w-4', iconColor)} />
            </div>
          )}
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
        </div>
        {headerActions}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
