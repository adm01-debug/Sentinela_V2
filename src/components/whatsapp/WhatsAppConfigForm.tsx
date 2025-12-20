import { memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface WhatsAppConfigFormProps {
  config: {
    phone_number_id: string;
    business_account_id: string;
    access_token: string;
    webhook_verify_token: string;
    is_active: boolean;
  };
  onChange: (config: any) => void;
  onSave: () => void;
  isSaving: boolean;
}

function WhatsAppConfigFormComponent({ config, onChange, onSave, isSaving }: WhatsAppConfigFormProps) {
  const [showToken, setShowToken] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuração da API</CardTitle>
        <CardDescription>
          Configure suas credenciais do WhatsApp Business API
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone_number_id">Phone Number ID</Label>
            <Input
              id="phone_number_id"
              value={config.phone_number_id}
              onChange={(e) => onChange({ ...config, phone_number_id: e.target.value })}
              placeholder="Seu Phone Number ID"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="business_account_id">Business Account ID</Label>
            <Input
              id="business_account_id"
              value={config.business_account_id}
              onChange={(e) => onChange({ ...config, business_account_id: e.target.value })}
              placeholder="Seu Business Account ID"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="access_token">Access Token</Label>
          <div className="relative">
            <Input
              id="access_token"
              type={showToken ? 'text' : 'password'}
              value={config.access_token}
              onChange={(e) => onChange({ ...config, access_token: e.target.value })}
              placeholder="Seu Access Token permanente"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={() => setShowToken(!showToken)}
            >
              {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="webhook_verify_token">Webhook Verify Token</Label>
          <Input
            id="webhook_verify_token"
            value={config.webhook_verify_token}
            onChange={(e) => onChange({ ...config, webhook_verify_token: e.target.value })}
            placeholder="Token para verificação do webhook"
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={config.is_active}
              onCheckedChange={(checked) => onChange({ ...config, is_active: checked })}
            />
            <Label htmlFor="is_active">Integração ativa</Label>
          </div>

          <Button onClick={onSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Salvar Configuração
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export const WhatsAppConfigForm = memo(WhatsAppConfigFormComponent);
