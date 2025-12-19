import { memo } from 'react';
import { Edit2, Trash2, PlayCircle, Globe, Zap, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { Webhook } from '@/hooks/useWebhooks';
import { WEBHOOK_EVENTS } from '@/hooks/useWebhooksPage';

interface WebhooksListProps {
  webhooks: Webhook[];
  onEdit: (webhook: Webhook) => void;
  onDelete: (webhook: Webhook) => void;
  onTest: (webhook: Webhook) => void;
  onToggleActive: (webhook: Webhook) => void;
}

function WebhooksListComponent({
  webhooks,
  onEdit,
  onDelete,
  onTest,
  onToggleActive,
}: WebhooksListProps) {
  const getEventLabel = (event: string) => {
    const found = WEBHOOK_EVENTS.find(e => e.value === event);
    return found?.label || event;
  };

  if (webhooks.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Nenhum webhook configurado</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {webhooks.map((webhook) => (
        <Card key={webhook.id} className={!webhook.is_active ? 'opacity-60' : ''}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${webhook.is_active ? 'bg-green-500/10' : 'bg-muted'}`}>
                  <Zap className={`h-5 w-5 ${webhook.is_active ? 'text-green-500' : 'text-muted-foreground'}`} />
                </div>
                <div>
                  <CardTitle className="text-lg">{webhook.name}</CardTitle>
                  <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                    {webhook.url}
                  </p>
                </div>
              </div>
              <Switch
                checked={webhook.is_active}
                onCheckedChange={() => onToggleActive(webhook)}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Events */}
            <div className="flex flex-wrap gap-1">
              {webhook.events?.slice(0, 3).map((event) => (
                <Badge key={event} variant="secondary" className="text-xs">
                  {getEventLabel(event)}
                </Badge>
              ))}
              {webhook.events && webhook.events.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{webhook.events.length - 3}
                </Badge>
              )}
            </div>

            {/* Config */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {webhook.timeout_seconds}s timeout
              </span>
              <span>{webhook.retry_count} retries</span>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => onTest(webhook)}>
                      <PlayCircle className="h-4 w-4 mr-1" />
                      Testar
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Enviar requisição de teste</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Button variant="ghost" size="icon" onClick={() => onEdit(webhook)}>
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onDelete(webhook)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export const WebhooksList = memo(WebhooksListComponent);
