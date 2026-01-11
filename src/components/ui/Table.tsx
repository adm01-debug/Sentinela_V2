import { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export const Table = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className="relative w-full overflow-auto">
    <table className={cn('w-full caption-bottom text-sm', className)}>{children}</table>
  </div>
);

export const TableHeader = ({ children }: { children: ReactNode }) => <thead className="[&_tr]:border-b">{children}</thead>;
export const TableBody = ({ children }: { children: ReactNode }) => <tbody className="[&_tr:last-child]:border-0">{children}</tbody>;
export const TableRow = ({ children, className, onClick }: { children: ReactNode; className?: string; onClick?: () => void }) => (
  <tr className={cn('border-b transition-colors hover:bg-muted/50', onClick && 'cursor-pointer', className)} onClick={onClick}>{children}</tr>
);
export const TableHead = ({ children, className }: { children: ReactNode; className?: string }) => (
  <th className={cn('h-12 px-4 text-left align-middle font-medium text-muted-foreground', className)}>{children}</th>
);
export const TableCell = ({ children, className }: { children: ReactNode; className?: string }) => (
  <td className={cn('p-4 align-middle', className)}>{children}</td>
);