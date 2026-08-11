import { useMemo, useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import type { SecurityViolation } from '@/hooks/useSecurityViolations';

type Severity = SecurityViolation['severity'];
type Status = SecurityViolation['status'];

export interface DrilldownDateRange {
  from: string; // ISO date (yyyy-MM-dd) inclusive
  to: string;   // ISO date (yyyy-MM-dd) inclusive
}

interface ViolationsDrilldownDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  violations: SecurityViolation[];
  /** Filtro inicial por tipo. */
  violationType?: string | null;
  /** Filtro inicial por severidade. */
  initialSeverity?: Severity | null;
  /** Intervalo de datas (inclusive) para restringir. */
  dateRange?: DrilldownDateRange | null;
  /** Título override; caso ausente, gerado automaticamente. */
  titleOverride?: string;
  pageSize?: number;
}

const SEVERITY_TOKEN: Record<Severity, string> = {
  low: 'bg-info/15 text-info border-info/30',
  medium: 'bg-warning/15 text-warning border-warning/30',
  high: 'bg-destructive/15 text-destructive border-destructive/30',
  critical: 'bg-destructive/25 text-destructive border-destructive/50',
};

const STATUS_TOKEN: Record<Status, string> = {
  pending: 'bg-warning/15 text-warning border-warning/30',
  reviewed: 'bg-info/15 text-info border-info/30',
  resolved: 'bg-success/15 text-success border-success/30',
  dismissed: 'bg-muted text-muted-foreground border-border',
};

const SEVERITY_LABEL: Record<Severity, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  critical: 'Crítica',
};

export function ViolationsDrilldownDialog({
  open,
  onOpenChange,
  violations,
  violationType = null,
  initialSeverity = null,
  dateRange = null,
  titleOverride,
  pageSize = 10,
}: ViolationsDrilldownDialogProps) {
  const [severity, setSeverity] = useState<Severity | 'all'>('all');
  const [status, setStatus] = useState<Status | 'all'>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Reset ao abrir ou mudar contexto de drill-down
  useEffect(() => {
    if (open) {
      setSeverity(initialSeverity ?? 'all');
      setStatus('all');
      setSearch('');
      setPage(1);
    }
  }, [open, violationType, initialSeverity, dateRange?.from, dateRange?.to]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const fromMs = dateRange ? new Date(`${dateRange.from}T00:00:00`).getTime() : null;
    const toMs = dateRange ? new Date(`${dateRange.to}T23:59:59.999`).getTime() : null;

    return violations.filter((v) => {
      if (violationType && v.violation_type !== violationType) return false;
      if (severity !== 'all' && v.severity !== severity) return false;
      if (status !== 'all' && v.status !== status) return false;
      if (fromMs !== null && toMs !== null) {
        const t = new Date(v.created_at).getTime();
        if (t < fromMs || t > toMs) return false;
      }
      if (term) {
        const haystack = [
          v.description,
          v.employee?.name ?? '',
          v.employee?.email ?? '',
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [violations, violationType, severity, status, search, dateRange]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  useEffect(() => {
    setPage(1);
  }, [severity, status, search]);

  const title = useMemo(() => {
    if (titleOverride) return titleOverride;
    if (violationType) return `Violações do tipo: ${violationType}`;
    if (initialSeverity) return `Violações de severidade: ${SEVERITY_LABEL[initialSeverity]}`;
    if (dateRange) {
      return dateRange.from === dateRange.to
        ? `Violações em ${format(new Date(`${dateRange.from}T00:00:00`), 'dd/MM/yyyy', { locale: ptBR })}`
        : `Violações entre ${dateRange.from} e ${dateRange.to}`;
    }
    return 'Detalhes de violações';
  }, [titleOverride, violationType, initialSeverity, dateRange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            <span data-testid="drill-count">{filtered.length}</span> ocorrência
            {filtered.length === 1 ? '' : 's'} encontrada
            {filtered.length === 1 ? '' : 's'} com os filtros atuais.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <Label htmlFor="drill-search" className="text-xs text-muted-foreground">
              Buscar
            </Label>
            <Input
              id="drill-search"
              placeholder="Colaborador, e-mail ou descrição"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Severidade</Label>
            <Select value={severity} onValueChange={(v) => setSeverity(v as Severity | 'all')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="critical">Crítica</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as Status | 'all')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="reviewed">Em análise</SelectItem>
                <SelectItem value="resolved">Resolvido</SelectItem>
                <SelectItem value="dismissed">Descartado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex-1 overflow-auto rounded-md border">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Colaborador</TableHead>
                <TableHead>Severidade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Descrição</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                    Nenhuma violação encontrada
                  </TableCell>
                </TableRow>
              ) : (
                pageItems.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="whitespace-nowrap text-sm">
                      {format(new Date(v.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{v.employee?.name ?? '—'}</div>
                      <div className="text-xs text-muted-foreground">{v.employee?.email ?? ''}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={SEVERITY_TOKEN[v.severity]}>
                        {SEVERITY_LABEL[v.severity]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={STATUS_TOKEN[v.status]}>
                        {v.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[320px] truncate text-sm text-muted-foreground">
                      {v.description}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between gap-3 pt-2">
          <div className="text-xs text-muted-foreground">
            Página {currentPage} de {totalPages}
          </div>
          <Pagination className="mx-0 w-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setPage((p) => Math.max(1, p - 1));
                  }}
                  aria-disabled={currentPage === 1}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }).slice(0, 5).map((_, i) => {
                const pageNum = i + 1;
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      href="#"
                      isActive={pageNum === currentPage}
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(pageNum);
                      }}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setPage((p) => Math.min(totalPages, p + 1));
                  }}
                  aria-disabled={currentPage === totalPages}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
