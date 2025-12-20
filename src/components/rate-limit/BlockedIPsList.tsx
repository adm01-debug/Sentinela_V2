import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Unlock, Shield } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BlockedIP {
  id: string;
  ip_address: string;
  reason: string;
  blocked_at: string;
  expires_at: string | null;
}

interface BlockedIPsListProps {
  blockedIPs: BlockedIP[];
  onUnblock: (ip: string) => void;
  isUnblocking?: boolean;
}

export const BlockedIPsList = React.memo(function BlockedIPsList({
  blockedIPs,
  onUnblock,
  isUnblocking,
}: BlockedIPsListProps) {
  if (blockedIPs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            IPs Bloqueados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Nenhum IP bloqueado no momento
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          IPs Bloqueados ({blockedIPs.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {blockedIPs.map((ip) => (
            <div
              key={ip.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="space-y-1">
                <div className="font-mono font-medium">{ip.ip_address}</div>
                <div className="text-sm text-muted-foreground">{ip.reason}</div>
                <div className="flex gap-2">
                  <Badge variant="outline">
                    Bloqueado {formatDistanceToNow(new Date(ip.blocked_at), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </Badge>
                  {ip.expires_at && (
                    <Badge variant="secondary">
                      Expira em {formatDistanceToNow(new Date(ip.expires_at), { locale: ptBR })}
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUnblock(ip.ip_address)}
                disabled={isUnblocking}
              >
                <Unlock className="h-4 w-4 mr-2" />
                Desbloquear
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});
