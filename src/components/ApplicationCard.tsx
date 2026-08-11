import { cn } from '@/lib/utils';
import type { ApplicationUsage } from '@/data/employeeDetailData';

const categoryStyles = {
  productive: 'border-success/30 bg-success/5',
  neutral: 'border-border',
  unproductive: 'border-destructive/30 bg-destructive/5',
};

const categoryLabels = {
  productive: 'Produtivo',
  neutral: 'Neutro',
  unproductive: 'Improdutivo',
};

interface ApplicationCardProps {
  application: ApplicationUsage;
}

export function ApplicationCard({ application }: ApplicationCardProps) {
  const hours = Math.floor(application.duration / 60);
  const minutes = application.duration % 60;
  const timeString = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  return (
    <div className={cn(
      'flex items-center gap-3 rounded-lg border p-3 transition-colors',
      categoryStyles[application.category]
    )}>
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-xl">
        {application.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{application.name}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{timeString}</span>
          <span>•</span>
          <span className={cn(
            application.category === 'productive' ? 'text-success' :
            application.category === 'unproductive' ? 'text-destructive' :
            'text-muted-foreground'
          )}>
            {categoryLabels[application.category]}
          </span>
        </div>
      </div>
      <div className="text-xs text-muted-foreground">
        {application.lastUsed}
      </div>
    </div>
  );
}
