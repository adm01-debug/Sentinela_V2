import { useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  Gauge,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/EmptyStates";
import { RateLimitSettings, useRateLimitDashboardPage } from "@/hooks/useRateLimitDashboardPage";

interface SettingsFormData {
  endpoint: string;
  max_requests: string;
  window_seconds: string;
  block_duration_seconds: string;
  is_active: boolean;
}

const EMPTY_FORM: SettingsFormData = {
  endpoint: "",
  max_requests: "60",
  window_seconds: "60",
  block_duration_seconds: "300",
  is_active: true,
};

const formatDateTime = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("pt-BR");
};

export default function RateLimitDashboardPage() {
  const {
    logs,
    settings,
    stats,
    filters,
    isLoading,
    isError,
    error,
    isRefreshing,
    handleFilterChange,
    handleUpdateSettings,
    handleCreateSettings,
    handleDeleteSettings,
    handleRefresh,
    isUpdating,
    isCreating,
    isDeleting,
  } = useRateLimitDashboardPage();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<RateLimitSettings | null>(null);
  const [deleting, setDeleting] = useState<RateLimitSettings | null>(null);
  const [form, setForm] = useState<SettingsFormData>(EMPTY_FORM);

  const endpointOptions = useMemo(() => {
    const values = new Set<string>();
    settings.forEach((item) => values.add(item.endpoint));
    logs.forEach((item) => values.add(item.endpoint));
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }, [settings, logs]);

  const identifierTypes = useMemo(
    () => Array.from(new Set(logs.map((item) => item.identifier_type))).sort(),
    [logs]
  );

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setIsDialogOpen(true);
  };

  const openEdit = (item: RateLimitSettings) => {
    setEditing(item);
    setForm({
      endpoint: item.endpoint,
      max_requests: String(item.max_requests),
      window_seconds: String(item.window_seconds),
      block_duration_seconds: String(item.block_duration_seconds),
      is_active: item.is_active,
    });
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  };

  const duplicateEndpoint =
    !editing && settings.some((item) => item.endpoint === form.endpoint.trim());

  const canSubmit =
    form.endpoint.trim().length > 0 &&
    Number(form.max_requests) > 0 &&
    Number(form.window_seconds) > 0 &&
    Number(form.block_duration_seconds) >= 0 &&
    !duplicateEndpoint;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const payload = {
      endpoint: form.endpoint.trim(),
      max_requests: Math.trunc(Number(form.max_requests)),
      window_seconds: Math.trunc(Number(form.window_seconds)),
      block_duration_seconds: Math.trunc(Number(form.block_duration_seconds)),
      is_active: form.is_active,
    };
    if (editing) {
      handleUpdateSettings({ id: editing.id, ...payload });
    } else {
      handleCreateSettings(payload);
    }
    closeDialog();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rate Limiting"
        description="Volume de requisicoes por identificador e os limites aplicados por endpoint nas edge functions."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Novo limite
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Requisicoes observadas</CardDescription>
            <CardTitle className="text-2xl">
              {stats.totalRequests.toLocaleString("pt-BR")}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-xs">
            Soma das janelas lidas abaixo
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Identificadores unicos</CardDescription>
            <CardTitle className="text-2xl">{stats.uniqueIdentifiers}</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-xs">
            IPs, usuarios ou agentes distintos
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Endpoints mais chamados</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            {stats.topEndpoints.length === 0 ? (
              <p className="text-muted-foreground text-xs">Sem dados no periodo</p>
            ) : (
              stats.topEndpoints.map(([endpoint, total]) => (
                <div key={endpoint} className="flex items-center justify-between gap-2">
                  <span className="truncate font-mono text-xs">{endpoint}</span>
                  <span className="text-muted-foreground text-xs">{total}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Identificadores mais ativos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            {stats.topIdentifiers.length === 0 ? (
              <p className="text-muted-foreground text-xs">Sem dados no periodo</p>
            ) : (
              stats.topIdentifiers.map(([identifier, total]) => (
                <div key={identifier} className="flex items-center justify-between gap-2">
                  <span className="truncate font-mono text-xs">{identifier}</span>
                  <span className="text-muted-foreground text-xs">{total}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            Limites por endpoint
          </CardTitle>
          <CardDescription>
            Limite global usado pelo rate limiter das edge functions. Sem linha para o endpoint,
            vale o default do codigo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
            </div>
          ) : settings.length === 0 ? (
            <EmptyState
              icon={Gauge}
              title="Nenhum limite configurado"
              description="Crie um limite para reduzir abuso em um endpoint especifico."
              primaryAction={{ label: "Criar limite", onClick: openCreate, icon: Plus }}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Endpoint</TableHead>
                  <TableHead>Requisicoes</TableHead>
                  <TableHead className="hidden md:table-cell">Janela</TableHead>
                  <TableHead className="hidden md:table-cell">Bloqueio</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settings.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-xs">{item.endpoint}</TableCell>
                    <TableCell>{item.max_requests}</TableCell>
                    <TableCell className="hidden md:table-cell">{item.window_seconds}s</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {item.block_duration_seconds}s
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={item.is_active}
                          onCheckedChange={(checked) =>
                            handleUpdateSettings({ id: item.id, is_active: checked })
                          }
                          aria-label={`Ativar limite de ${item.endpoint}`}
                        />
                        <Badge variant={item.is_active ? "default" : "secondary"}>
                          {item.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleting(item)}>
                        <Trash2 className="text-destructive h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Requisicoes registradas
          </CardTitle>
          <CardDescription>
            Ultimas 100 janelas de contagem registradas pelo rate limiter.
          </CardDescription>
          <div className="grid gap-2 pt-4 sm:grid-cols-3">
            <Input
              value={filters.search}
              onChange={(event) => handleFilterChange("search", event.target.value)}
              placeholder="Buscar identificador"
            />
            <Select
              value={filters.endpoint}
              onValueChange={(value) => handleFilterChange("endpoint", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Endpoint" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os endpoints</SelectItem>
                {endpointOptions.map((endpoint) => (
                  <SelectItem key={endpoint} value={endpoint}>
                    {endpoint}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.identifierType}
              onValueChange={(value) => handleFilterChange("identifierType", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {identifierTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <AlertCircle className="text-destructive h-8 w-8" />
              <p className="text-muted-foreground text-sm">
                {error?.message ?? "Nao foi possivel carregar os logs de rate limit."}
              </p>
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                Tentar novamente
              </Button>
            </div>
          ) : logs.length === 0 ? (
            <EmptyState
              icon={Activity}
              title="Nenhuma requisicao no periodo"
              description="Ajuste os filtros ou aguarde novas chamadas as edge functions."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Identificador</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Endpoint</TableHead>
                  <TableHead>Requisicoes</TableHead>
                  <TableHead className="hidden md:table-cell">Janela</TableHead>
                  <TableHead className="hidden lg:table-cell">Registrado em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs">{log.identifier}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.identifier_type}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{log.endpoint}</TableCell>
                    <TableCell>{log.request_count ?? 0}</TableCell>
                    <TableCell className="hidden text-xs md:table-cell">
                      {formatDateTime(log.window_start)}
                    </TableCell>
                    <TableCell className="hidden text-xs lg:table-cell">
                      {formatDateTime(log.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => (open ? setIsDialogOpen(true) : closeDialog())}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar limite" : "Novo limite"}</DialogTitle>
            <DialogDescription>
              Vale para todas as chamadas ao endpoint nas edge functions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rate-limit-endpoint">Endpoint</Label>
              <Input
                id="rate-limit-endpoint"
                value={form.endpoint}
                onChange={(event) => setForm({ ...form, endpoint: event.target.value })}
                placeholder="Ex.: send-whatsapp"
                disabled={!!editing}
              />
              {duplicateEndpoint && (
                <p className="text-destructive text-xs">Ja existe um limite para este endpoint.</p>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="rate-limit-max">Requisicoes</Label>
                <Input
                  id="rate-limit-max"
                  type="number"
                  min={1}
                  value={form.max_requests}
                  onChange={(event) => setForm({ ...form, max_requests: event.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rate-limit-window">Janela (s)</Label>
                <Input
                  id="rate-limit-window"
                  type="number"
                  min={1}
                  value={form.window_seconds}
                  onChange={(event) => setForm({ ...form, window_seconds: event.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rate-limit-block">Bloqueio (s)</Label>
                <Input
                  id="rate-limit-block"
                  type="number"
                  min={0}
                  value={form.block_duration_seconds}
                  onChange={(event) =>
                    setForm({ ...form, block_duration_seconds: event.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="text-sm font-medium">Ativo</p>
                <p className="text-muted-foreground text-xs">
                  Desative para ignorar este limite sem apagar a configuracao.
                </p>
              </div>
              <Switch
                checked={form.is_active}
                onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={!canSubmit || isUpdating || isCreating}>
              {(isUpdating || isCreating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editing ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir limite?</AlertDialogTitle>
            <AlertDialogDescription>
              O endpoint &quot;{deleting?.endpoint}&quot; volta a usar o default do codigo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleting) handleDeleteSettings(deleting.id);
                setDeleting(null);
              }}
              disabled={isDeleting}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
