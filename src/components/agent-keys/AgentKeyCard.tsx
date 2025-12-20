import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Key, MoreVertical, Eye, Copy, Ban } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AgentKey {
  id: string;
  key: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  expires_at: string | null;
  last_used_at: string | null;
  usage_count: number;
}

interface AgentKeyCardProps {
  agentKey: AgentKey;
  onViewDetails: (key: AgentKey) => void;
  onCopy: (key: string) => void;
  onRevoke: (id: string) => void;
  onReactivate: (id: string) => void;
}

export const AgentKeyCard = React.memo(function AgentKeyCard({
  agentKey,
  onViewDetails,
  onCopy,
  onRevoke,
  onReactivate,
}: AgentKeyCardProps) {
  const isExpired = agentKey.expires_at && new Date(agentKey.expires_at) < new Date();
  const maskedKey = agentKey.key.slice(0, 7) + '...' + agentKey.key.slice(-4);

  return (
    <Card className={!agentKey.is_active ? 'opacity-60' : ''}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-muted rounded-lg">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium">{agentKey.name}</h3>
              <p className="text-sm text-muted-foreground font-mono">{maskedKey}</p>
              {agentKey.description && (
                <p className="text-sm text-muted-foreground mt-1">{agentKey.description}</p>
              )}
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewDetails(agentKey)}>
                <Eye className="h-4 w-4 mr-2" />
                Ver detalhes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onCopy(agentKey.key)}>
                <Copy className="h-4 w-4 mr-2" />
                Copiar chave
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {agentKey.is_active ? (
                <DropdownMenuItem 
                  onClick={() => onRevoke(agentKey.id)}
                  className="text-destructive"
                >
                  <Ban className="h-4 w-4 mr-2" />
                  Revogar
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => onReactivate(agentKey.id)}>
                  Reativar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={agentKey.is_active ? (isExpired ? 'destructive' : 'default') : 'secondary'}>
              {!agentKey.is_active ? 'Revogada' : isExpired ? 'Expirada' : 'Ativa'}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {agentKey.usage_count} usos
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {agentKey.last_used_at 
              ? `Usado ${formatDistanceToNow(new Date(agentKey.last_used_at), { addSuffix: true, locale: ptBR })}`
              : 'Nunca usado'
            }
          </span>
        </div>
      </CardContent>
    </Card>
  );
});
