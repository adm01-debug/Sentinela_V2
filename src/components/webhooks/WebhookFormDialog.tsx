import { memo } from 'react';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { WebhookFormData } from '@/hooks/useWebhooksPage';
import { WEBHOOK_EVENTS } from '@/hooks/useWebhooksPage';

interface WebhookFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: WebhookFormData;
  setFormData: (data: WebhookFormData) => void;
  onToggleEvent: (event: string) => void;
  onSubmit: () => void;
  isEditing?: boolean;
  isSubmitting?: boolean;
}

function WebhookFormDialogComponent({
  open,
  onOpenChange,
  formData,
  setFormData,
  onToggleEvent,
  onSubmit,
  isEditing = false,
  isSubmitting = false,
}: WebhookFormDialogProps) {
  const [showSecret, setShowSecret] = useState(false);

  const handleChange = (field: keyof WebhookFormData, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Webhook' : 'Novo Webhook'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Ex: Notificação Slack"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">URL *</Label>
            <Input
              id="url"
              value={formData.url}
              onChange={(e) => handleChange('url', e.target.value)}
              placeholder="https://example.com/webhook"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="secret">Secret (opcional)</Label>
            <div className="relative">
              <Input
                id="secret"
                type={showSecret ? 'text' : 'password'}
                value={formData.secret}
                onChange={(e) => handleChange('secret', e.target.value)}
                placeholder="Token de autenticação"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0"
                onClick={() => setShowSecret(!showSecret)}
              >
                {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="retry_count">Tentativas</Label>
              <Input
                id="retry_count"
                type="number"
                value={formData.retry_count}
                onChange={(e) => handleChange('retry_count', parseInt(e.target.value) || 0)}
                min={0}
                max={10}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeout_seconds">Timeout (s)</Label>
              <Input
                id="timeout_seconds"
                type="number"
                value={formData.timeout_seconds}
                onChange={(e) => handleChange('timeout_seconds', parseInt(e.target.value) || 30)}
                min={5}
                max={120}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label>Webhook Ativo</Label>
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => handleChange('is_active', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label>Eventos</Label>
            <div className="grid grid-cols-2 gap-2 p-3 border rounded-lg max-h-[200px] overflow-y-auto">
              {WEBHOOK_EVENTS.map((event) => (
                <label
                  key={event.value}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <Checkbox
                    checked={formData.events.includes(event.value)}
                    onCheckedChange={() => onToggleEvent(event.value)}
                  />
                  <span className="text-sm">{event.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={onSubmit}
            disabled={!formData.name.trim() || !formData.url.trim() || isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? 'Salvar' : 'Criar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export const WebhookFormDialog = memo(WebhookFormDialogComponent);
