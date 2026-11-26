import {
  Activity,
  AlertCircle,
  Clock,
  Keyboard,
  RefreshCw,
  Search,
  ShieldAlert,
} from "lucide-react";
import { format } from "date-fns";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { EmptyState } from "@/components/EmptyStates";
import {
  KEYSTROKE_LIMIT,
  formatKeystroke,
  useKeystrokeDetailsPage,
} from "@/hooks/useKeystrokeDetailsPage";

const ALL = "__all__";

export default function KeystrokeDetailsPage() {
  const {
    from,
    setFrom,
    to,
    setTo,
    employee,
    setEmployee,
    application,
    setApplication,
    key,
    setKey,
    onlySensitive,
    setOnlySensitive,
    entries,
    allEntries,
    summary,
    applicationOptions,
    employees,
    hasFilters,
    clearFilters,
    isLoading,
    isError,
    refetch,
  } = useKeystrokeDetailsPage();

  const topApplications = summary.applications.slice(0, 3);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Detalhe de Digitação"
        description="Teclas individuais enviadas pelo agente no período selecionado. Registros de campos sensíveis aparecem mascarados."
        actions={
          <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={isLoading ? "mr-2 h-4 w-4 animate-spin" : "mr-2 h-4 w-4"} />
            Atualizar
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtros</CardTitle>
          <CardDescription>
            A consulta traz no máximo {KEYSTROKE_LIMIT} registros do período, dos mais recentes para
            os mais antigos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="keystroke-from">De</Label>
              <Input
                id="keystroke-from"
                type="date"
                value={from}
                onChange={(event) => setFrom(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="keystroke-to">Até</Label>
              <Input
                id="keystroke-to"
                type="date"
                value={to}
                onChange={(event) => setTo(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="keystroke-employee">Funcionário</Label>
              <Select
                value={employee || ALL}
                onValueChange={(value) => setEmployee(value === ALL ? "" : value)}
              >
                <SelectTrigger id="keystroke-employee">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Todos</SelectItem>
                  {employees.map((item) => (
                    <SelectItem key={item.id} value={item.name}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="keystroke-application">Aplicativo</Label>
              <Select
                value={application || ALL}
                onValueChange={(value) => setApplication(value === ALL ? "" : value)}
              >
                <SelectTrigger id="keystroke-application">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Todos</SelectItem>
                  {applicationOptions.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-4">
            <div className="min-w-[200px] flex-1 space-y-2">
              <Label htmlFor="keystroke-key">Buscar tecla</Label>
              <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  id="keystroke-key"
                  className="pl-9"
                  placeholder="Ex.: Enter, Ctrl, a"
                  value={key}
                  onChange={(event) => setKey(event.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 pb-2">
              <Switch
                id="keystroke-sensitive"
                checked={onlySensitive}
                onCheckedChange={setOnlySensitive}
              />
              <Label htmlFor="keystroke-sensitive">Somente campos sensíveis</Label>
            </div>
            {hasFilters && (
              <Button variant="ghost" onClick={clearFilters} className="pb-2">
                Limpar filtros
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teclas no filtro</CardTitle>
            <Keyboard className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total}</div>
            <p className="text-muted-foreground text-xs">{allEntries.length} no período</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campos sensíveis</CardTitle>
            <ShieldAlert className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.sensitive}</div>
            <p className="text-muted-foreground text-xs">Teclas mascaradas na lista</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aplicativos</CardTitle>
            <Activity className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.applications.length}</div>
            <p className="text-muted-foreground truncate text-xs">
              {topApplications.length > 0
                ? topApplications.map((item) => `${item.name} (${item.count})`).join(" · ")
                : "Sem registros"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dispositivos</CardTitle>
            <Clock className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.devices}</div>
            <p className="text-muted-foreground text-xs">Máquinas com teclas no filtro</p>
          </CardContent>
        </Card>
      </div>

      {isError ? (
        <EmptyState
          icon={AlertCircle}
          title="Não foi possível carregar o detalhe de digitação"
          description="A leitura de keystroke_details falhou. Tente novamente em instantes."
          primaryAction={{ label: "Tentar novamente", onClick: () => refetch(), icon: RefreshCw }}
        />
      ) : isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <EmptyState
          icon={Keyboard}
          title={hasFilters ? "Nenhuma tecla com esses filtros" : "Nenhuma tecla no período"}
          description={
            hasFilters
              ? "Ajuste o funcionário, o aplicativo, a tecla ou o período para ver registros."
              : "Escolha outro período ou confirme se o agente está enviando o detalhe de digitação nas estações monitoradas."
          }
          primaryAction={
            hasFilters ? { label: "Limpar filtros", onClick: clearFilters } : undefined
          }
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Teclas registradas</CardTitle>
            <CardDescription>
              {entries.length} de {allEntries.length} registros do período
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quando</TableHead>
                  <TableHead>Funcionário</TableHead>
                  <TableHead>Aplicativo</TableHead>
                  <TableHead>Tecla</TableHead>
                  <TableHead>Campo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-mono text-xs whitespace-nowrap">
                      {format(new Date(entry.recorded_at), "dd/MM HH:mm:ss")}
                    </TableCell>
                    <TableCell>{entry.employee_name}</TableCell>
                    <TableCell>
                      <div className="text-sm">{entry.app_name ?? "—"}</div>
                      {entry.window_title && (
                        <div className="text-muted-foreground max-w-[280px] truncate text-xs">
                          {entry.window_title}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <kbd className="bg-muted rounded border px-2 py-0.5 font-mono text-xs">
                        {formatKeystroke(entry)}
                      </kbd>
                    </TableCell>
                    <TableCell>
                      {entry.is_sensitive ? (
                        <Badge variant="destructive">Sensível</Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">Comum</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
