import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Smartphone, Monitor, Tablet, Trash2, Shield, ShieldCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { useAuth } from '@/hooks/useAuth';

interface KnownDevice {
  id: string;
  device_fingerprint: string;
  ip_address: string;
  browser_name: string;
  os_name: string;
  device_type: string;
  first_seen_at: string;
  last_seen_at: string;
  is_trusted: boolean;
}

export function KnownDevicesPanel() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { getKnownDevices, removeDevice, trustDevice } = useDeviceDetection();

  const { data: devices, isLoading } = useQuery({
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
    onError: () => {
      toast.error('Erro ao remover dispositivo');
    },
  });

  const trustMutation = useMutation({
    mutationFn: trustDevice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['known-devices'] });
      toast.success('Dispositivo marcado como confiável');
    },
    onError: () => {
      toast.error('Erro ao atualizar dispositivo');
    },
  });

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="h-5 w-5" />;
      case 'tablet':
        return <Tablet className="h-5 w-5" />;
      default:
        return <Monitor className="h-5 w-5" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Dispositivos Conhecidos
        </CardTitle>
        <CardDescription>
          Gerencie os dispositivos que já acessaram sua conta
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!devices || devices.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum dispositivo registrado ainda
          </p>
        ) : (
          <div className="space-y-3">
            {devices.map((device: KnownDevice) => (
              <div
                key={device.id}
                className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {getDeviceIcon(device.device_type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{device.browser_name}</span>
                      <span className="text-muted-foreground">em</span>
                      <span className="font-medium">{device.os_name}</span>
                      {device.is_trusted && (
                        <Badge variant="secondary" className="ml-2">
                          <ShieldCheck className="h-3 w-3 mr-1" />
                          Confiável
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span>IP: {device.ip_address}</span>
                      <span className="mx-2">•</span>
                      <span>
                        Último acesso:{' '}
                        {formatDistanceToNow(new Date(device.last_seen_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
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
                      disabled={trustMutation.isPending}
                    >
                      <ShieldCheck className="h-4 w-4 mr-1" />
                      Confiar
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => removeMutation.mutate(device.id)}
                    disabled={removeMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
