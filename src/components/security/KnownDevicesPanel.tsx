import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Smartphone, Monitor, Tablet, Trash2, Shield, ShieldCheck, Loader2 } from 'lucide-react';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type DeviceType = 'mobile' | 'tablet' | 'desktop' | (string & {});

interface KnownDevice {
  id: string;
  device_fingerprint: string;
  ip_address: string;
  browser_name: string;
  os_name: string;
  device_type: DeviceType;
  first_seen_at: string;
  last_seen_at: string;
  is_trusted: boolean;
}

function DeviceIcon({ type }: { type: DeviceType }) {
  const Icon =
    type?.toLowerCase() === 'mobile' ? Smartphone :
    type?.toLowerCase() === 'tablet' ? Tablet :
    Monitor;
  return <Icon className="h-5 w-5" aria-hidden="true" />;
}

function DevicesSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-56" />
        <Skeleton className="h-4 w-72" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-4 border rounded-lg gap-4">
            <div className="flex items-center gap-4 flex-1">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-64" />
              </div>
            </div>
            <Skeleton className="h-9 w-24" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function KnownDevicesPanel() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { getKnownDevices, removeDevice, trustDevice } = useDeviceDetection();
  const [pendingRemove, setPendingRemove] = useState<KnownDevice | null>(null);

  const { data: devices, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['known-devices', user?.id],
    queryFn: () => getKnownDevices(user?.id || ''),
    enabled: !!user?.id,
  });

  const removeMutation = useMutation({
    mutationFn: removeDevice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['known-devices'] });
      toast.success('Dispositivo removido com sucesso');
    },
    onError: () => toast.error('Erro ao remover dispositivo'),
    onSettled: () => setPendingRemove(null),
  });

  const trustMutation = useMutation({
    mutationFn: trustDevice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['known-devices'] });
      toast.success('Dispositivo marcado como confiável');
    },
    onError: () => toast.error('Erro ao atualizar dispositivo'),
  });

  if (isLoading) return <DevicesSkeleton />;

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" aria-hidden="true" />
            Dispositivos Conhecidos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-center py-6">
          <p className="text-sm text-muted-foreground">
            Não foi possível carregar seus dispositivos. {error instanceof Error ? error.message : ''}
          </p>
          <Button variant="outline" onClick={() => refetch()}>Tentar novamente</Button>
        </CardContent>
      </Card>
    );
  }

  const list = (devices ?? []) as KnownDevice[];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" aria-hidden="true" />
            Dispositivos Conhecidos
          </CardTitle>
          <CardDescription>
            Gerencie os dispositivos que já acessaram sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          {list.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum dispositivo registrado ainda
            </p>
          ) : (
            <ul className="space-y-3">
              {list.map((device) => {
                const trustingThis = trustMutation.isPending && trustMutation.variables === device.id;
                const removingThis = removeMutation.isPending && removeMutation.variables === device.id;
                const lastSeen = new Date(device.last_seen_at);
                const lastSeenValid = !Number.isNaN(lastSeen.getTime());
                const deviceLabel = `${device.browser_name} em ${device.os_name}`;
                return (
                  <li
                    key={device.id}
                    className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors gap-3 flex-wrap"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                        <DeviceIcon type={device.device_type} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{device.browser_name}</span>
                          <span className="text-muted-foreground">em</span>
                          <span className="font-medium">{device.os_name}</span>
                          {device.is_trusted && (
                            <Badge variant="secondary" className="ml-1">
                              <ShieldCheck className="h-3 w-3 mr-1" aria-hidden="true" />
                              Confiável
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-2">
                          <span>IP: {device.ip_address || '—'}</span>
                          <span aria-hidden="true">•</span>
                          <span>
                            Último acesso:{' '}
                            {lastSeenValid ? (
                              <time
                                dateTime={lastSeen.toISOString()}
                                title={format(lastSeen, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                              >
                                {formatDistanceToNow(lastSeen, { addSuffix: true, locale: ptBR })}
                              </time>
                            ) : '—'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!device.is_trusted && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => trustMutation.mutate(device.id)}
                          disabled={trustingThis}
                          aria-label={`Marcar ${deviceLabel} como confiável`}
                        >
                          {trustingThis ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" aria-hidden="true" />
                          ) : (
                            <ShieldCheck className="h-4 w-4 mr-1" aria-hidden="true" />
                          )}
                          Confiar
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setPendingRemove(device)}
                        disabled={removingThis}
                        aria-label={`Remover ${deviceLabel}`}
                      >
                        {removingThis
                          ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                          : <Trash2 className="h-4 w-4" aria-hidden="true" />}
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!pendingRemove} onOpenChange={(o) => !o && setPendingRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover dispositivo?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingRemove
                ? `Isso removerá "${pendingRemove.browser_name} em ${pendingRemove.os_name}" da lista de dispositivos conhecidos. Se ele acessar sua conta novamente, será tratado como novo dispositivo.`
                : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removeMutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => pendingRemove && removeMutation.mutate(pendingRemove.id)}
              disabled={removeMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removeMutation.isPending ? 'Removendo...' : 'Remover'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
