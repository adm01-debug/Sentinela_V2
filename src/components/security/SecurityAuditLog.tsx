import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Lock,
  Key,
  Globe,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';

export type AuditCategory = 'auth' | 'data' | 'admin' | 'system' | 'security';
export type AuditSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  action: string;
  category: AuditCategory;
  severity: AuditSeverity;
  userId?: string;
  userEmail?: string;
  ip?: string;
  details?: unknown;
  success: boolean;
}

const CATEGORY_ICONS: Record<AuditCategory, LucideIcon> = {
  auth: Key,
  data: Lock,
  admin: User,
  system: Globe,
  security: Shield,
};

const CATEGORY_LABELS: Record<AuditCategory | 'all', string> = {
  all: 'Todas',
  auth: 'Autenticação',
  data: 'Acesso a dados',
  admin: 'Administração',
  system: 'Sistema',
  security: 'Segurança',
};

const SEVERITY_STYLES: Record<AuditSeverity, string> = {
  info: 'bg-primary/15 text-primary',
  warning: 'bg-warning/15 text-warning',
  error: 'bg-destructive/15 text-destructive',
  critical: 'bg-destructive text-destructive-foreground',
};

const SEVERITY_LABELS: Record<AuditSeverity, string> = {
  info: 'Informação',
  warning: 'Aviso',
  error: 'Erro',
  critical: 'Crítico',
};

const FILTERS: readonly (AuditCategory | 'all')[] = [
  'all',
  'auth',
  'data',
  'admin',
  'security',
  'system',
];

interface SecurityAuditLogProps {
  entries: AuditLogEntry[];
  maxHeight?: number;
  className?: string;
}

function safeTimestamp(ts: Date | string | number | null | undefined): Date | null {
  if (!ts) return null;
  const d = ts instanceof Date ? ts : new Date(ts);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function SecurityAuditLog({
  entries,
  maxHeight = 400,
  className,
}: SecurityAuditLogProps) {
  const [filter, setFilter] = useState<AuditCategory | 'all'>('all');

  const filtered = useMemo(
    () => (filter === 'all' ? entries : entries.filter((e) => e.category === filter)),
    [entries, filter],
  );

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" aria-hidden="true" />
            Registro de auditoria
          </CardTitle>
          <div className="flex items-center gap-2">
            <Label htmlFor="audit-filter" className="sr-only">
              Filtrar por categoria
            </Label>
            <select
              id="audit-filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value as AuditCategory | 'all')}
              className="text-sm border rounded-md bg-background px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Filtrar por categoria"
            >
              {FILTERS.map((f) => (
                <option key={f} value={f}>
                  {CATEGORY_LABELS[f]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea style={{ height: maxHeight }}>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <AlertTriangle className="h-8 w-8 mb-2 opacity-50" aria-hidden="true" />
              <p className="text-sm">Nenhum registro de auditoria</p>
            </div>
          ) : (
            <ul className="space-y-2" aria-label="Eventos de auditoria">
              {filtered.map((entry) => {
                const Icon = CATEGORY_ICONS[entry.category];
                const ts = safeTimestamp(entry.timestamp);
                return (
                  <li
                    key={entry.id}
                    className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div
                      className={cn(
                        'p-2 rounded-full shrink-0',
                        entry.success ? 'bg-success/15' : 'bg-destructive/15',
                      )}
                      aria-hidden="true"
                    >
                      {entry.success ? (
                        <CheckCircle className="h-4 w-4 text-success" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{entry.action}</span>
                        <Badge className={SEVERITY_STYLES[entry.severity]}>
                          {SEVERITY_LABELS[entry.severity]}
                        </Badge>
                        <Badge variant="outline" className="gap-1">
                          <Icon className="h-3 w-3" aria-hidden="true" />
                          {CATEGORY_LABELS[entry.category]}
                        </Badge>
                        <span className="sr-only">
                          Resultado: {entry.success ? 'sucesso' : 'falha'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground flex-wrap">
                        {ts && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" aria-hidden="true" />
                            <time dateTime={ts.toISOString()}>{ts.toLocaleString('pt-BR')}</time>
                          </span>
                        )}
                        {entry.userEmail && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" aria-hidden="true" />
                            <span className="sr-only">Usuário: </span>
                            {entry.userEmail}
                          </span>
                        )}
                        {entry.ip && (
                          <span className="flex items-center gap-1">
                            <Globe className="h-3 w-3" aria-hidden="true" />
                            <span className="sr-only">IP: </span>
                            <span className="font-mono">{entry.ip}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default SecurityAuditLog;
