import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
}

export function Pagination({ currentPage, totalPages, onPageChange, showFirstLast = true }: PaginationProps) {
  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <div className="flex items-center gap-1">
      {showFirstLast && <Button variant="outline" size="icon" onClick={() => onPageChange(1)} disabled={!canGoPrev}><ChevronsLeft className="h-4 w-4" /></Button>}
      <Button variant="outline" size="icon" onClick={() => onPageChange(currentPage - 1)} disabled={!canGoPrev}><ChevronLeft className="h-4 w-4" /></Button>
      <span className="px-3 text-sm">{currentPage} de {totalPages}</span>
      <Button variant="outline" size="icon" onClick={() => onPageChange(currentPage + 1)} disabled={!canGoNext}><ChevronRight className="h-4 w-4" /></Button>
      {showFirstLast && <Button variant="outline" size="icon" onClick={() => onPageChange(totalPages)} disabled={!canGoNext}><ChevronsRight className="h-4 w-4" /></Button>}
    </div>
  );
}
