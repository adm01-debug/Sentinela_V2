import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertTriangle, Loader2, RefreshCw, ShieldOff } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/EmptyStates";
import {
  REDACTION_ALL,
  REDACTION_PERIODS,
  labelForRedactionAction,
  useDLPRedactionLogPage,
} from "@/hooks/useDLPRedactionLogPage";

const actionTone: Record<string, string> = {
  block: "bg-destructive/15 text-destructive",
  redact: "bg-warning/15 text-warning",
  alert: "bg-muted text-muted-foreground",
};

export default function DLPRedactionLogPage() {
  const {
    days,
    setDays,
    action,
    setAction,
    classifier,
    setClassifier,
    entries,
    summary,
    classifierOptions,
    companyNames,
    actionOptions,
    isLoading,
    isError,
    refetch,
  } = useDLPRedactionLogPage();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Log de redações DLP"
        description="Registro append-only do que o agente fez com cada incidente de DLP: alertou, redigiu ou bloqueou. Alimentado pela edge dlp-incident-report; não pode ser editado pela tela."
        actions={
          <Button variant="outline" onClick={() => void refetch()} disabled={isLoading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Eventos no período</CardDescription>
            <CardTitle className="text-2xl">{summary.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Redigidos</CardDescription>
            <CardTitle className="text-2xl">{summary.redacted}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Bloqueados</CardDescription>
            <CardTitle className="text-2xl">{summary.blocked}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Classificadores acionados</CardDescription>
            <CardTitle className="text-2xl">{summary.classifiers.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldOff className="h-4 w-4" />
            Eventos
          </CardTitle>
          <CardDescription>
            Filtre por período, ação aplicada e classificador. A tabela guarda no máximo os 500
            eventos mais recentes do período.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <Label htmlFor="redaction-period" className="text-muted-foreground text-xs">
                Período
              </Label>
              <Select value={String(days)} onValueChange={(value) => setDays(Number(value))}>
                <SelectTrigger id="redaction-period">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REDACTION_PERIODS.map((period) => (
                    <SelectItem key={period.value} value={String(period.value)}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="redaction-action" className="text-muted-foreground text-xs">
                Ação
              </Label>
              <Select value={action} onValueChange={setAction}>
                <SelectTrigger id="redaction-action">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={REDACTION_ALL}>Todas</SelectItem>
                  {actionOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {labelForRedactionAction(option)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="redaction-classifier" className="text-muted-foreground text-xs">
                Classificador
              </Label>
              <Select value={classifier} onValueChange={setClassifier}>
                <SelectTrigger id="redaction-classifier">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={REDACTION_ALL}>Todos</SelectItem>
                  {classifierOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="text-muted-foreground flex items-center justify-center py-10">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Carregando eventos...
            </div>
          ) : isError ? (
            <EmptyState
              icon={AlertTriangle}
              title="Nao foi possivel carregar o log"
              description="Tente novamente; se persistir, verifique as permissoes de administrador."
              primaryAction={{ label: "Tentar novamente", onClick: () => void refetch() }}
            />
          ) : entries.length === 0 ? (
            <EmptyState
              icon={ShieldOff}
              title="Nenhuma redação no período"
              description="O log recebe uma linha quando o agente reporta um incidente de DLP. Nenhum evento para os filtros escolhidos."
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Classificador</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Regiões</TableHead>
                    <TableHead>Incidente</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(entry.occurred_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        {entry.company_id
                          ? companyNames.get(entry.company_id) || "Empresa removida"
                          : "Global"}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{entry.classifier_code}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={actionTone[entry.action] ?? "bg-muted text-muted-foreground"}
                        >
                          {labelForRedactionAction(entry.action)}
                        </Badge>
                      </TableCell>
                      <TableCell>{entry.bbox_count ?? 0}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {entry.incident_id ? `${entry.incident_id.slice(0, 8)}...` : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export { DLPRedactionLogPage };
