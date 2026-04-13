import { BarChart3 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface DensityMapProps {
  hourlyDensity: Record<number, number>;
  maxDensity: number;
  totalRecordings: number;
  currentHour: number | null;
  selectedHour: number | null;
  onJumpToHour: (hour: number) => void;
}

export function DensityMap({ hourlyDensity, maxDensity, totalRecordings, currentHour, selectedHour, onJumpToHour }: DensityMapProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <BarChart3 className="h-4 w-4" />
        <span>Densidade de gravações por hora:</span>
        <span className="text-xs">({totalRecordings} total)</span>
      </div>
      
      <TooltipProvider>
        <div className="flex gap-0.5 h-16 items-end bg-muted/30 rounded-lg p-2">
          {Array.from({ length: 24 }, (_, hour) => {
            const count = hourlyDensity[hour] || 0;
            const heightPercent = count > 0 ? Math.max((count / maxDensity) * 100, 10) : 0;
            const hasRecordings = count > 0;
            const isSelected = selectedHour === hour;
            const isCurrent = currentHour === hour;
            
            return (
              <Tooltip key={hour}>
                <TooltipTrigger asChild>
                  <button
                    className={`flex-1 flex flex-col items-center justify-end gap-1 transition-all ${hasRecordings ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                    onClick={() => hasRecordings && onJumpToHour(hour)}
                    disabled={!hasRecordings}
                  >
                    <div
                      className={`w-full rounded-t transition-all ${isSelected ? 'bg-primary' : isCurrent ? 'bg-primary/70' : hasRecordings ? 'bg-primary/40 hover:bg-primary/60' : 'bg-muted/50'}`}
                      style={{ height: `${heightPercent}%`, minHeight: hasRecordings ? '4px' : '2px' }}
                    />
                    <span className={`text-[9px] ${isCurrent ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                      {hour.toString().padStart(2, '0')}
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  <p className="font-medium">{hour.toString().padStart(2, '0')}:00</p>
                  <p>{count} gravações</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>
    </div>
  );
}
