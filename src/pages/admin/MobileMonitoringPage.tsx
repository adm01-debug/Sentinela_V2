import { useMemo, useState } from "react";
import {
  AlertCircle,
  ExternalLink,
  Loader2,
  MapPin,
  PowerOff,
  RefreshCw,
  Smartphone,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { MobileDevicesMap } from "@/components/MobileDevicesMap";
import { OsmMap } from "@/components/map/OsmMap";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
import { MobileDevice, useMobileMonitoringPage } from "@/hooks/useMobileMonitoringPage";

const formatDateTime = (value: string | null) => {
  if (!value) return "Nunca";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("pt-BR");
};

const relativeTime = (value: string | null) => {
  if (!value) return "sem registro";
  const diffMs = Date.now() - new Date(value).getTime();
  if (Number.isNaN(diffMs)) return "sem registro";
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "agora";
  if (minutes < 60) return `${minutes} min atrás`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h atrás`;
  return `${Math.floor(hours / 24)} d atrás`;
};

const mapUrl = (lat: number, lng: number) =>
  `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`;

export default function MobileMonitoringPage() {
  const {
    selectedDevice,
    statusFilter,
    setStatusFilter,
    searchTerm,
    setSearchTerm,
    autoRefresh,
    setAutoRefresh,
    devices,
    allDevices,
    activities,
    stats,
    isLoadingDevices,
    isErrorDevices,
    isLoadingActivities,
    isErrorActivities,
    handleSelectDevice,
    handleToggleActive,
    isToggling,
  } = useMobileMonitoringPage();

  const [deactivating, setDeactivating] = useState<MobileDevice | null>(null);

  const locationPoints = useMemo(
    () => activities.filter((item) => item.latitude != null && item.longitude != null),
    [activities]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Monitoramento Mobile"
        description="Aparelhos com o app instalado, última localização conhecida e atividades registradas pelo mobile-collector."
        actions={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Switch
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
                aria-label="Atualização automática"
              />
              <span className="text-muted-foreground text-xs">Auto 30s</span>
            </div>
            <Button
              variant="outline"
              onClick={() => handleSelectDevice(null)}
              disabled={!selectedDevice}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Limpar seleção
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Aparelhos cadastrados</CardDescription>
            <CardTitle className="text-2xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Ativos</CardDescription>
            <CardTitle className="text-2xl">{stats.online}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Desativados</CardDescription>
            <CardTitle className="text-2xl">{stats.offline}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Vistos nas últimas 24h</CardDescription>
            <CardTitle className="text-2xl">{stats.seenToday}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Mapa dos aparelhos
          </CardTitle>
          <CardDescription>
            Última localização conhecida de cada aparelho. Clique em um ponto para abrir as
            atividades registradas por ele.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingDevices ? (
            <div className="flex justify-center py-10">
              <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
            </div>
          ) : (
            <MobileDevicesMap
              devices={devices}
              selectedDeviceId={selectedDevice?.id ?? null}
              onDeviceClick={(device) => handleSelectDevice(device)}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Aparelhos
          </CardTitle>
          <CardDescription>
            Desativar um aparelho interrompe o envio de dados pelo app sem apagar o histórico.
          </CardDescription>
          <div className="flex flex-col gap-2 pt-4 sm:flex-row">
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar por colaborador, modelo ou identificador"
              className="sm:flex-1"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="sm:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="online">Ativos</SelectItem>
                <SelectItem value="offline">Desativados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingDevices ? (
            <div className="flex justify-center py-10">
              <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
            </div>
          ) : isErrorDevices ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <AlertCircle className="text-destructive h-8 w-8" />
              <p className="text-muted-foreground text-sm">
                Não foi possível carregar os aparelhos cadastrados.
              </p>
            </div>
          ) : devices.length === 0 ? (
            <EmptyState
              icon={Smartphone}
              title={allDevices.length === 0 ? "Nenhum aparelho cadastrado" : "Nada encontrado"}
              description={
                allDevices.length === 0
                  ? "Os aparelhos aparecem aqui quando o app mobile se registra pelo mobile-collector."
                  : "Ajuste a busca ou o filtro de status."
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Colaborador</TableHead>
                  <TableHead>Aparelho</TableHead>
                  <TableHead className="hidden md:table-cell">Versão do app</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead className="hidden lg:table-cell">Último sinal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {devices.map((device) => (
                  <TableRow key={device.id}>
                    <TableCell>
                      <p className="font-medium">{device.employee_name}</p>
                      <p className="text-muted-foreground font-mono text-xs">{device.device_id}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{device.device_model}</p>
                      <p className="text-muted-foreground text-xs">
                        {device.os} {device.os_version}
                      </p>
                    </TableCell>
                    <TableCell className="hidden text-sm md:table-cell">
                      {device.app_version || "-"}
                    </TableCell>
                    <TableCell>
                      {device.last_location ? (
                        <a
                          href={mapUrl(device.last_location.lat, device.last_location.lng)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary inline-flex items-center gap-1 text-xs hover:underline"
                        >
                          <MapPin className="h-3.5 w-3.5" />
                          {device.last_location.lat.toFixed(4)},{" "}
                          {device.last_location.lng.toFixed(4)}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground text-xs">Sem localização</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden text-xs lg:table-cell">
                      {relativeTime(device.last_seen)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={device.is_online ? "default" : "secondary"}>
                        {device.is_online ? "Ativo" : "Desativado"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSelectDevice(device)}
                      >
                        Atividades
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          device.is_online ? setDeactivating(device) : handleToggleActive(device)
                        }
                        disabled={isToggling}
                        aria-label={device.is_online ? "Desativar aparelho" : "Reativar aparelho"}
                      >
                        <PowerOff
                          className={`h-4 w-4 ${device.is_online ? "text-destructive" : "text-muted-foreground"}`}
                        />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedDevice} onOpenChange={(open) => !open && handleSelectDevice(null)}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedDevice?.employee_name}</DialogTitle>
            <DialogDescription>
              {selectedDevice?.device_model} - {selectedDevice?.os} {selectedDevice?.os_version} -
              ultimo sinal {formatDateTime(selectedDevice?.last_seen ?? null)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-3">
              <div className="rounded-md border p-3">
                <p className="text-muted-foreground text-xs">Atividades registradas</p>
                <p className="text-lg font-medium">{activities.length}</p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-muted-foreground text-xs">Pontos de localização</p>
                <p className="text-lg font-medium">{locationPoints.length}</p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-muted-foreground text-xs">Última localização</p>
                {locationPoints[0] ? (
                  <a
                    href={mapUrl(locationPoints[0].latitude ?? 0, locationPoints[0].longitude ?? 0)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary text-sm hover:underline"
                  >
                    ver no mapa
                  </a>
                ) : (
                  <p className="text-muted-foreground text-sm">sem dados</p>
                )}
              </div>
            </div>

            {locationPoints.length > 0 && (
              <OsmMap
                markers={locationPoints.map((point) => ({
                  id: point.id,
                  latitude: point.latitude ?? 0,
                  longitude: point.longitude ?? 0,
                  label: point.activity_type,
                  description: formatDateTime(point.recorded_at),
                  tone: "activity" as const,
                }))}
                ariaLabel="Pontos de localização registrados pelo aparelho"
              />
            )}

            {isLoadingActivities ? (
              <div className="flex justify-center py-8">
                <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
              </div>
            ) : isErrorActivities ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <AlertCircle className="text-destructive h-7 w-7" />
                <p className="text-muted-foreground text-sm">
                  Não foi possível carregar as atividades deste aparelho.
                </p>
              </div>
            ) : activities.length === 0 ? (
              <EmptyState
                icon={Smartphone}
                title="Nenhuma atividade registrada"
                description="Atividades de uso e localização aparecem aqui quando o app envia dados."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Aplicativo</TableHead>
                    <TableHead>Duração</TableHead>
                    <TableHead className="hidden md:table-cell">Localização</TableHead>
                    <TableHead>Registrado em</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activities.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell>
                        <Badge variant="outline">{activity.activity_type}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{activity.app_name || "-"}</TableCell>
                      <TableCell className="text-sm">
                        {activity.duration_seconds != null ? `${activity.duration_seconds}s` : "-"}
                      </TableCell>
                      <TableCell className="hidden text-xs md:table-cell">
                        {activity.latitude != null && activity.longitude != null ? (
                          <a
                            href={mapUrl(activity.latitude, activity.longitude)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary inline-flex items-center gap-1 hover:underline"
                          >
                            <MapPin className="h-3 w-3" />
                            {activity.latitude.toFixed(4)}, {activity.longitude.toFixed(4)}
                          </a>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-xs">
                        {formatDateTime(activity.recorded_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deactivating} onOpenChange={(open) => !open && setDeactivating(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Desativar aparelho?</DialogTitle>
            <DialogDescription>
              {deactivating?.employee_name} ({deactivating?.device_model}) para de enviar dados de
              uso e localização até ser reativado. O histórico já registrado permanece.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeactivating(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={isToggling}
              onClick={() => {
                if (deactivating) handleToggleActive(deactivating);
                setDeactivating(null);
              }}
            >
              Desativar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
