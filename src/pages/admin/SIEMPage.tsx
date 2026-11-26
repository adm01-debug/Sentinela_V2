import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Loader2,
  Pause,
  Pencil,
  Play,
  Plus,
  Power,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { PageHeader } from "@/components/layout/PageHeader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/EmptyStates";
import {
  CONNECTOR_TYPE_LABEL,
  DELIVERY_LIMIT,
  ENDPOINT_PLACEHOLDER,
  EVENT_TYPE_LABEL,
  HEALTH_LABEL,
  OUTBOX_LIMIT,
  OUTBOX_STATUS_LABEL,
  PAUSE_MINUTES,
  SEVERITY_OPTIONS,
  connectorHealth,
  formatAge,
  severityLabel,
  useSIEMPage,
  type ConnectorHealth,
  type SiemConnectorType,
  type SiemEventType,
  type SiemOutboxStatus,
} from "@/hooks/useSIEMPage";

const HEALTH_VARIANT: Record<ConnectorHealth, "default" | "secondary" | "destructive" | "outline"> =
  {
    active: "default",
    paused: "secondary",
    failing: "destructive",
    inactive: "outline",
  };

const OUTBOX_VARIANT: Record<
  SiemOutboxStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "secondary",
  sent: "default",
  failed: "destructive",
  dead_letter: "outline",
};

const EVENT_TYPES: SiemEventType[] = [
  "security_violation",
  "dlp_incident",
  "ueba_anomaly",
  "auth_event",
  "policy_change",
];

export default function SIEMPage() {
  const {
    connectors,
    allConnectors,
    outbox,
    deliveries,
    outboxSummary,
    deliverySummary,
    oldestPending,
    connectorName,
    term,
    setTerm,
    onlyActive,
    setOnlyActive,
    hasFilters,
    clearFilters,
    dialogOpen,
    setDialogOpen,
    editing,
    formData,
    setFormData,
    toggleEventFilter,
    handleOpenCreate,
    handleOpenEdit,
    handleSubmit,
    removing,
    setRemoving,
    handleRemove,
    handleToggleActive,
    handlePause,
    handleResume,
    isSaving,
    isRemoving,
    isLoading,
    isError,
    refetchAll,
  } = useSIEMPage();

  const activeConnectors = allConnectors.filter(
    (item) => connectorHealth(item) === "active"
  ).length;
  const failingConnectors = allConnectors.filter(
    (item) => connectorHealth(item) === "failing"
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Conectores SIEM"
        description="Envio dos eventos de segurança para Splunk, Sentinel, syslog CEF ou webhook, com fila e histórico de entrega."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetchAll()} disabled={isLoading}>
              <RefreshCw className={isLoading ? "mr-2 h-4 w-4 animate-spin" : "mr-2 h-4 w-4"} />
              Atualizar
            </Button>
            <Button onClick={handleOpenCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Novo conector
            </Button>
          </div>
        }
      />

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>A entrega é feita pelo dispatcher do ADR-008</AlertTitle>
        <AlertDescription>
          Cada violação, incidente DLP ou anomalia enfileira um evento por conector ativo. Enquanto
          o dispatcher não estiver publicando, os eventos ficam em &quot;Na fila&quot; e nada sai da
          plataforma.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conectores ativos</CardTitle>
            <CheckCircle2 className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeConnectors}</div>
            <p className="text-muted-foreground text-xs">
              {allConnectors.length} cadastrados
              {failingConnectors > 0 ? ` · ${failingConnectors} com falha` : ""}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Na fila</CardTitle>
            <Loader2 className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{outboxSummary.pending}</div>
            <p className="text-muted-foreground text-xs">
              {oldestPending
                ? `Mais antigo: ${formatAge(oldestPending.enqueued_at)}`
                : "Nenhum evento esperando"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Falhas e descartes</CardTitle>
            <AlertTriangle className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {outboxSummary.failed + outboxSummary.deadLetter}
            </div>
            <p className="text-muted-foreground text-xs">
              {outboxSummary.deadLetter} descartados após as tentativas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de entrega</CardTitle>
            <Power className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {deliverySummary.total === 0 ? "—" : `${deliverySummary.successRate}%`}
            </div>
            <p className="text-muted-foreground text-xs">
              {deliverySummary.total === 0
                ? "Nenhuma entrega registrada"
                : `${deliverySummary.total} entregas · ${deliverySummary.failuresLast24h} falhas em 24h`}
            </p>
          </CardContent>
        </Card>
      </div>

      {isError ? (
        <EmptyState
          icon={AlertTriangle}
          title="Não foi possível carregar a configuração de SIEM"
          description="A leitura de siem_connectors, siem_event_outbox ou siem_delivery_log falhou. Tente novamente."
          primaryAction={{
            label: "Tentar novamente",
            onClick: () => refetchAll(),
            icon: RefreshCw,
          }}
        />
      ) : isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full" />
          ))}
        </div>
      ) : (
        <>
          <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base">Conectores</CardTitle>
                <CardDescription>
                  {connectors.length} de {allConnectors.length} conectores
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <Input
                    className="w-[220px] pl-9"
                    placeholder="Buscar por nome, tipo ou endereço"
                    value={term}
                    onChange={(event) => setTerm(event.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="siem-only-active"
                    checked={onlyActive}
                    onCheckedChange={setOnlyActive}
                  />
                  <Label htmlFor="siem-only-active">Somente ativos</Label>
                </div>
                {hasFilters && (
                  <Button variant="ghost" onClick={clearFilters}>
                    Limpar
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {connectors.length === 0 ? (
                <div className="p-6">
                  <EmptyState
                    icon={Power}
                    title={
                      hasFilters ? "Nenhum conector com esse filtro" : "Nenhum conector cadastrado"
                    }
                    description={
                      hasFilters
                        ? "Ajuste a busca ou desligue o filtro de ativos."
                        : "Sem conector, nenhum evento de segurança sai da plataforma. Cadastre o primeiro para começar a enfileirar."
                    }
                    primaryAction={
                      hasFilters
                        ? { label: "Limpar filtros", onClick: clearFilters }
                        : { label: "Novo conector", onClick: handleOpenCreate, icon: Plus }
                    }
                  />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Conector</TableHead>
                      <TableHead>Endereço</TableHead>
                      <TableHead>Eventos</TableHead>
                      <TableHead>Severidade</TableHead>
                      <TableHead>Situação</TableHead>
                      <TableHead>Última entrega</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {connectors.map((connector) => {
                      const health = connectorHealth(connector);
                      return (
                        <TableRow key={connector.id}>
                          <TableCell>
                            <div className="font-medium">{connector.name}</div>
                            <div className="text-muted-foreground text-xs">
                              {CONNECTOR_TYPE_LABEL[connector.connector_type]}
                              {connector.description ? ` · ${connector.description}` : ""}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[240px] truncate font-mono text-xs">
                            {connector.endpoint}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {(connector.event_filters ?? []).map((eventType) => (
                                <Badge key={eventType} variant="outline" className="text-[10px]">
                                  {EVENT_TYPE_LABEL[eventType]}
                                </Badge>
                              ))}
                              {(connector.event_filters ?? []).length === 0 && (
                                <span className="text-muted-foreground text-xs">Nenhum</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {severityLabel(connector.min_severity)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={HEALTH_VARIANT[health]}>{HEALTH_LABEL[health]}</Badge>
                            {health === "failing" && connector.last_error && (
                              <div className="text-destructive mt-1 max-w-[200px] truncate text-xs">
                                {connector.consecutive_failures}x: {connector.last_error}
                              </div>
                            )}
                            {health === "paused" && connector.paused_until && (
                              <div className="text-muted-foreground mt-1 text-xs">
                                volta às {format(new Date(connector.paused_until), "HH:mm")}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs">
                            {connector.last_success_at
                              ? formatAge(connector.last_success_at)
                              : "nunca enviou"}
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Editar"
                                onClick={() => handleOpenEdit(connector)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              {health === "paused" ? (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="Retomar envio"
                                  onClick={() => handleResume(connector)}
                                >
                                  <Play className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title={`Pausar por ${PAUSE_MINUTES} minutos`}
                                  onClick={() => handlePause(connector)}
                                >
                                  <Pause className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                title={connector.is_active ? "Desativar" : "Ativar"}
                                onClick={() => handleToggleActive(connector)}
                              >
                                <Power className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Remover"
                                onClick={() => setRemoving(connector)}
                              >
                                <Trash2 className="text-destructive h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Fila de eventos</CardTitle>
                <CardDescription>
                  {outbox.length} de até {OUTBOX_LIMIT} eventos mais recentes
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {outbox.length === 0 ? (
                  <div className="text-muted-foreground p-6 text-sm">
                    Nenhum evento enfileirado. A fila só recebe eventos quando existe conector ativo
                    interessado no tipo do evento.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Quando</TableHead>
                        <TableHead>Conector</TableHead>
                        <TableHead>Evento</TableHead>
                        <TableHead>Situação</TableHead>
                        <TableHead>Tentativas</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {outbox.slice(0, OUTBOX_LIMIT).map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell className="text-xs whitespace-nowrap">
                            <div>{format(new Date(entry.enqueued_at), "dd/MM HH:mm")}</div>
                            <div className="text-muted-foreground">
                              {formatAge(entry.enqueued_at)}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs">
                            {connectorName(entry.connector_id)}
                          </TableCell>
                          <TableCell>
                            <div className="text-xs">{EVENT_TYPE_LABEL[entry.event_type]}</div>
                            <div className="text-muted-foreground text-[10px]">
                              {entry.source_table ?? "—"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={OUTBOX_VARIANT[entry.status]}>
                              {OUTBOX_STATUS_LABEL[entry.status]}
                            </Badge>
                            {entry.last_error && (
                              <div className="text-destructive mt-1 max-w-[160px] truncate text-[10px]">
                                {entry.last_error}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-xs">{entry.attempts}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Histórico de entregas</CardTitle>
                <CardDescription>
                  {deliverySummary.total === 0
                    ? "Nenhuma entrega registrada"
                    : `${deliverySummary.success} sucessos · ${deliverySummary.failure} falhas${
                        deliverySummary.averageLatencyMs === null
                          ? ""
                          : ` · média ${deliverySummary.averageLatencyMs} ms`
                      }`}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {deliveries.length === 0 ? (
                  <div className="text-muted-foreground p-6 text-sm">
                    O histórico é gravado pelo dispatcher a cada tentativa de envio.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Quando</TableHead>
                        <TableHead>Conector</TableHead>
                        <TableHead>HTTP</TableHead>
                        <TableHead>Latência</TableHead>
                        <TableHead>Resultado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deliveries.slice(0, DELIVERY_LIMIT).map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell className="text-xs whitespace-nowrap">
                            {format(new Date(entry.delivered_at), "dd/MM HH:mm:ss")}
                          </TableCell>
                          <TableCell className="text-xs">
                            {connectorName(entry.connector_id)}
                          </TableCell>
                          <TableCell className="text-xs">{entry.http_code ?? "—"}</TableCell>
                          <TableCell className="text-xs">
                            {entry.latency_ms === null ? "—" : `${entry.latency_ms} ms`}
                          </TableCell>
                          <TableCell>
                            <Badge variant={entry.status === "success" ? "default" : "destructive"}>
                              {entry.status === "success" ? "Entregue" : "Falhou"}
                            </Badge>
                            {entry.error && (
                              <div className="text-destructive mt-1 max-w-[160px] truncate text-[10px]">
                                {entry.error}
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar conector" : "Novo conector"}</DialogTitle>
            <DialogDescription>
              O endereço e os filtros definem quais eventos saem da plataforma. As credenciais são
              configuradas pelo dispatcher (ADR-008), não nesta tela.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="siem-name">Nome</Label>
                <Input
                  id="siem-name"
                  placeholder="Splunk corporativo"
                  value={formData.name}
                  onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="siem-type">Tipo</Label>
                <Select
                  value={formData.connectorType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, connectorType: value as SiemConnectorType })
                  }
                >
                  <SelectTrigger id="siem-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(CONNECTOR_TYPE_LABEL) as SiemConnectorType[]).map((type) => (
                      <SelectItem key={type} value={type}>
                        {CONNECTOR_TYPE_LABEL[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="siem-endpoint">Endereço de destino</Label>
              <Input
                id="siem-endpoint"
                placeholder={ENDPOINT_PLACEHOLDER[formData.connectorType]}
                value={formData.endpoint}
                onChange={(event) => setFormData({ ...formData, endpoint: event.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="siem-description">Descrição (opcional)</Label>
              <Textarea
                id="siem-description"
                rows={2}
                value={formData.description}
                onChange={(event) => setFormData({ ...formData, description: event.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Eventos enviados</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {EVENT_TYPES.map((eventType) => (
                  <label key={eventType} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={formData.eventFilters.includes(eventType)}
                      onCheckedChange={() => toggleEventFilter(eventType)}
                    />
                    {EVENT_TYPE_LABEL[eventType]}
                  </label>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="siem-severity">Severidade mínima</Label>
                <Select
                  value={formData.minSeverity}
                  onValueChange={(value) => setFormData({ ...formData, minSeverity: value })}
                >
                  <SelectTrigger id="siem-severity">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SEVERITY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="siem-timeout">Tempo limite (ms)</Label>
                <Input
                  id="siem-timeout"
                  type="number"
                  min={1000}
                  max={60000}
                  step={500}
                  value={formData.timeoutMs}
                  onChange={(event) => setFormData({ ...formData, timeoutMs: event.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="siem-active"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="siem-active">Conector ativo</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editing ? "Salvar" : "Criar conector"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(removing)} onOpenChange={(open) => !open && setRemoving(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover {removing?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Os eventos na fila e o histórico de entrega desse conector são apagados em cascata.
              Não há como desfazer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemove} disabled={isRemoving}>
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
