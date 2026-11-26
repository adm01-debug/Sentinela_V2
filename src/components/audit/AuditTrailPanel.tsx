import { useMemo, useState } from "react";
import { AlertTriangle, History, Search, ShieldCheck } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AUDIT_ACTIONS,
  EMPTY_AUDIT_FILTERS,
  actionLabel,
  describeEntry,
  diffValues,
  entityLabel,
  filterEntries,
  severityLabel,
  useAuditTrail,
  type AuditEntry,
} from "@/hooks/useAuditTrail";

const severityVariant: Record<string, "secondary" | "outline" | "destructive"> = {
  info: "secondary",
  warning: "outline",
  critical: "destructive",
};

export function AuditTrailPanel() {
  const { entries, entityTypes, summary, isLoading, error, limit } = useAuditTrail();
  const [filters, setFilters] = useState(EMPTY_AUDIT_FILTERS);
  const [selected, setSelected] = useState<AuditEntry | null>(null);

  const visible = useMemo(() => filterEntries(entries, filters), [entries, filters]);
  const diffs = useMemo(() => (selected ? diffValues(selected) : []), [selected]);

  if (isLoading) return <Skeleton className="h-64" />;

  if (error)
    return (
      <Card>
        <CardContent className="flex items-center gap-2 py-8 text-sm">
          <AlertTriangle className="text-destructive h-4 w-4" />
          <span>{error}</span>
        </CardContent>
      </Card>
    );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Alterações", value: summary.total },
          { label: "Criações", value: summary.creates },
          { label: "Exclusões", value: summary.deletes },
          { label: "Críticas", value: summary.critical },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold">{item.value}</p>
              <p className="text-muted-foreground text-xs">{item.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            className="pl-9"
            placeholder="Buscar por registro, usuário ou campo..."
            value={filters.term}
            onChange={(event) => setFilters({ ...filters, term: event.target.value })}
          />
        </div>
        <Select
          value={filters.action}
          onValueChange={(action) => setFilters({ ...filters, action })}
        >
          <SelectTrigger className="w-[170px]">
            <SelectValue placeholder="Ação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as ações</SelectItem>
            {AUDIT_ACTIONS.map((action) => (
              <SelectItem key={action} value={action}>
                {actionLabel(action)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.entityType}
          onValueChange={(entityType) => setFilters({ ...filters, entityType })}
        >
          <SelectTrigger className="w-[190px]">
            <SelectValue placeholder="Tipo de registro" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os registros</SelectItem>
            {entityTypes.map((entityType) => (
              <SelectItem key={entityType} value={entityType}>
                {entityLabel(entityType)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-muted-foreground text-xs">
        Mostrando {visible.length} de {summary.total} alterações (limite de {limit} por consulta) ·{" "}
        {summary.actors} {summary.actors === 1 ? "usuário distinto" : "usuários distintos"}
      </p>

      {visible.length === 0 ? (
        <Card>
          <CardContent className="text-muted-foreground py-12 text-center">
            <History className="mx-auto mb-4 h-12 w-12 opacity-50" />
            <p className="text-sm">
              {summary.total === 0
                ? "Nenhuma alteração registrada ainda. Funcionários, times, regras, escalas, cercas virtuais e webhooks gravam aqui a partir da primeira edição."
                : "Nenhuma alteração com esses filtros."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {visible.map((entry) => (
            <Card key={entry.id}>
              <CardContent className="flex flex-wrap items-start justify-between gap-3 p-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{actionLabel(entry.action)}</Badge>
                    <Badge variant={severityVariant[entry.severity] ?? "secondary"}>
                      {severityLabel(entry.severity)}
                    </Badge>
                    <span className="text-muted-foreground text-xs">
                      {entry.user_email || "sistema"}
                      {entry.user_role ? ` (${entry.user_role})` : ""}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-sm">{describeEntry(entry)}</p>
                  {entry.description && (
                    <p className="text-muted-foreground text-xs">{entry.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground text-xs whitespace-nowrap">
                    {format(new Date(entry.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </span>
                  <button
                    type="button"
                    className="text-primary text-xs underline-offset-2 hover:underline"
                    onClick={() => setSelected(entry)}
                  >
                    Detalhes
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              {selected ? describeEntry(selected) : "Detalhes da alteração"}
            </DialogTitle>
            <DialogDescription>
              {selected?.user_email || "sistema"} ·{" "}
              {selected
                ? format(new Date(selected.created_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })
                : ""}
            </DialogDescription>
          </DialogHeader>
          {diffs.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              O registro não guardou os campos alterados.
            </p>
          ) : (
            <div className="max-h-80 overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground text-left text-xs">
                    <th className="pb-2">Campo</th>
                    <th className="pb-2">Antes</th>
                    <th className="pb-2">Depois</th>
                  </tr>
                </thead>
                <tbody>
                  {diffs.map((diff) => (
                    <tr key={diff.field} className="border-t">
                      <td className="py-2 pr-3 font-medium">{diff.field}</td>
                      <td className="text-muted-foreground py-2 pr-3 break-all">{diff.from}</td>
                      <td className="py-2 break-all">{diff.to}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AuditTrailPanel;
