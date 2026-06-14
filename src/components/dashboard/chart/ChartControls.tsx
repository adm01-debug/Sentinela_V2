import { memo } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export interface ChartControlsProps {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onReset?: () => void;
  onExport?: (format: 'png' | 'svg' | 'pdf') => void;
  className?: string;
}

function ChartControlsComponent({ onZoomIn, onZoomOut, onReset, onExport, className }: ChartControlsProps) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {onZoomIn && <Button variant="ghost" size="icon" onClick={onZoomIn}><ZoomIn className="h-4 w-4" /></Button>}
      {onZoomOut && <Button variant="ghost" size="icon" onClick={onZoomOut}><ZoomOut className="h-4 w-4" /></Button>}
      {onReset && <Button variant="ghost" size="icon" onClick={onReset}><RotateCcw className="h-4 w-4" /></Button>}
      {onExport && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onExport('png')}>Exportar como PNG</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport('svg')}>Exportar como SVG</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport('pdf')}>Exportar como PDF</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

export const ChartControls = memo(ChartControlsComponent);
