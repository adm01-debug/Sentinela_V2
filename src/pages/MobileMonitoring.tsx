import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMobileDevices } from "@/hooks/useMobileDevices";
import { MobileDevicesMap } from "@/components/MobileDevicesMap";
import { 
  Smartphone, 
  Loader2, 
  RefreshCw, 
  MapPin, 
  Clock, 
  Trash2, 
  Power, 
  PowerOff,
  Activity,
  Download,
  QrCode,
  Map
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function MobileMonitoring() {
  const { devices, activityLogs, loading, toggleDeviceStatus, deleteDevice, refetch } = useMobileDevices();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const getOsIcon = (osType: string) => {
    return osType === "ios" ? "🍎" : "🤖";
  };

  const getActivityTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      app_usage: "Uso de App",
      location: "Localização",
      screen_time: "Tempo de Tela",
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Monitoramento Mobile</h1>
              <p className="text-muted-foreground mt-1">
                Gerencie dispositivos móveis e visualize atividades
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                Atualizar
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Smartphone className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{devices.length}</p>
                    <p className="text-sm text-muted-foreground">Total Dispositivos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <Power className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{devices.filter((d) => d.is_active).length}</p>
                    <p className="text-sm text-muted-foreground">Ativos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <span className="text-xl">🤖</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{devices.filter((d) => d.os_type === "android").length}</p>
                    <p className="text-sm text-muted-foreground">Android</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-500/10 rounded-lg">
                    <span className="text-xl">🍎</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{devices.filter((d) => d.os_type === "ios").length}</p>
                    <p className="text-sm text-muted-foreground">iOS</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="map" className="space-y-4">
            <TabsList>
              <TabsTrigger value="map">
                <Map className="h-4 w-4 mr-2" />
                Mapa
              </TabsTrigger>
              <TabsTrigger value="devices">Dispositivos</TabsTrigger>
              <TabsTrigger value="activity">Atividade Recente</TabsTrigger>
              <TabsTrigger value="install">Instalação</TabsTrigger>
            </TabsList>

            <TabsContent value="map">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Localização dos Dispositivos
                  </CardTitle>
                  <CardDescription>
                    Visualize a localização em tempo real de todos os dispositivos móveis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <MobileDevicesMap devices={devices} />
                  <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span>Ativo</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gray-500" />
                      <span>Inativo</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="devices">
              <Card>
                <CardHeader>
                  <CardTitle>Dispositivos Registrados</CardTitle>
                  <CardDescription>
                    Lista de todos os dispositivos móveis monitorados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {devices.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Smartphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum dispositivo móvel registrado</p>
                      <p className="text-sm mt-1">
                        Instale o app mobile nos dispositivos dos funcionários
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Funcionário</TableHead>
                          <TableHead>Dispositivo</TableHead>
                          <TableHead>Sistema</TableHead>
                          <TableHead>Última Localização</TableHead>
                          <TableHead>Última Atividade</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {devices.map((device) => (
                          <TableRow key={device.id}>
                            <TableCell className="font-medium">{device.employee_name}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span>{getOsIcon(device.os_type)}</span>
                                <span>{device.device_model || "Desconhecido"}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {device.os_type.toUpperCase()} {device.os_version}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {device.last_location_lat && device.last_location_lng ? (
                                <div className="flex items-center gap-1 text-sm">
                                  <MapPin className="h-3 w-3" />
                                  <span>
                                    {device.last_location_lat.toFixed(4)}, {device.last_location_lng.toFixed(4)}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {device.last_seen_at ? (
                                <div className="flex items-center gap-1 text-sm">
                                  <Clock className="h-3 w-3" />
                                  <span>
                                    {formatDistanceToNow(new Date(device.last_seen_at), {
                                      addSuffix: true,
                                      locale: ptBR,
                                    })}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant={device.is_active ? "default" : "secondary"}>
                                {device.is_active ? "Ativo" : "Inativo"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => toggleDeviceStatus(device.id, !device.is_active)}
                                >
                                  {device.is_active ? (
                                    <PowerOff className="h-4 w-4 text-destructive" />
                                  ) : (
                                    <Power className="h-4 w-4 text-green-500" />
                                  )}
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Remover Dispositivo</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Tem certeza que deseja remover este dispositivo? Os logs de atividade serão mantidos.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => deleteDevice(device.id)}>
                                        Remover
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Atividade Recente</CardTitle>
                  <CardDescription>
                    Últimas 50 atividades registradas dos dispositivos móveis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {activityLogs.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma atividade registrada</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Funcionário</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>App/Detalhes</TableHead>
                          <TableHead>Duração</TableHead>
                          <TableHead>Localização</TableHead>
                          <TableHead>Data/Hora</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {activityLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="font-medium">{log.employee_name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{getActivityTypeLabel(log.activity_type)}</Badge>
                            </TableCell>
                            <TableCell>{log.app_name || "-"}</TableCell>
                            <TableCell>
                              {log.duration_seconds
                                ? `${Math.round(log.duration_seconds / 60)} min`
                                : "-"}
                            </TableCell>
                            <TableCell>
                              {log.latitude && log.longitude ? (
                                <div className="flex items-center gap-1 text-sm">
                                  <MapPin className="h-3 w-3" />
                                  <span>
                                    {log.latitude.toFixed(4)}, {log.longitude.toFixed(4)}
                                  </span>
                                </div>
                              ) : (
                                "-"
                              )}
                            </TableCell>
                            <TableCell>
                              {format(new Date(log.recorded_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="install">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">🤖</span>
                      <div>
                        <CardTitle>Android</CardTitle>
                        <CardDescription>App de monitoramento para Android</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      O app Android oferece monitoramento completo incluindo:
                    </p>
                    <ul className="text-sm space-y-2">
                      <li className="flex items-center gap-2">
                        <span className="text-green-500">✓</span> Uso de aplicativos
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-500">✓</span> Localização em tempo real
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-500">✓</span> Tempo de tela
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-500">✓</span> Notificações push
                      </li>
                    </ul>
                    <Button className="w-full" disabled>
                      <Download className="h-4 w-4 mr-2" />
                      Download APK (Em breve)
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">🍎</span>
                      <div>
                        <CardTitle>iOS</CardTitle>
                        <CardDescription>App de monitoramento para iPhone/iPad</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      O app iOS possui funcionalidades limitadas devido às restrições da Apple:
                    </p>
                    <ul className="text-sm space-y-2">
                      <li className="flex items-center gap-2">
                        <span className="text-green-500">✓</span> Localização (com permissão)
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-500">✓</span> Tempo de tela (limitado)
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-yellow-500">⚠</span> Uso de apps (requer MDM)
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-500">✓</span> Notificações push
                      </li>
                    </ul>
                    <Button className="w-full" disabled>
                      <Download className="h-4 w-4 mr-2" />
                      App Store (Em breve)
                    </Button>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <QrCode className="h-8 w-8" />
                      <div>
                        <CardTitle>Instalação Rápida</CardTitle>
                        <CardDescription>
                          Escaneie o QR Code para instalar o app no dispositivo
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted/50 rounded-lg p-8 text-center">
                      <p className="text-muted-foreground mb-4">
                        O QR Code de instalação estará disponível após a publicação dos apps nas lojas.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Por enquanto, use o app Capacitor em modo de desenvolvimento para testes.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
