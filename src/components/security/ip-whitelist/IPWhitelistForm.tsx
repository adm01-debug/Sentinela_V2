import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { CreateWhitelistData } from '@/hooks/useIPWhitelist';

interface IPWhitelistFormProps {
  formData: CreateWhitelistData;
  formErrors: Record<string, string>;
  onUpdate: (data: Partial<CreateWhitelistData>) => void;
}

export function IPWhitelistForm({ formData, formErrors, onUpdate }: IPWhitelistFormProps) {
  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="ip_address">Endereço IP *</Label>
        <Input
          id="ip_address"
          value={formData.ip_address}
          onChange={e => onUpdate({ ip_address: e.target.value })}
          placeholder="192.168.1.1 ou 192.168.1.0/24"
          className={formErrors.ip_address ? 'border-destructive' : ''}
        />
        {formErrors.ip_address && (
          <p className="text-xs text-destructive">{formErrors.ip_address}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={e => onUpdate({ description: e.target.value })}
          placeholder="Ex: Servidor de produção, Office principal"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="expires_at">Expira em (opcional)</Label>
        <Input
          id="expires_at"
          type="datetime-local"
          value={formData.expires_at ? formData.expires_at.slice(0, 16) : ''}
          onChange={e => onUpdate({ 
            expires_at: e.target.value ? new Date(e.target.value).toISOString() : null 
          })}
        />
      </div>

      <div className="space-y-4 pt-4 border-t">
        <h4 className="font-medium text-sm">Permissões</h4>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Bypass Rate Limit</Label>
            <p className="text-xs text-muted-foreground">
              Ignora limites de requisições
            </p>
          </div>
          <Switch
            checked={formData.bypass_rate_limit}
            onCheckedChange={checked => onUpdate({ bypass_rate_limit: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Bypass Autenticação</Label>
            <p className="text-xs text-muted-foreground">
              ⚠️ Acesso sem autenticação (use com cuidado)
            </p>
          </div>
          <Switch
            checked={formData.bypass_auth}
            onCheckedChange={checked => onUpdate({ bypass_auth: checked })}
          />
        </div>
      </div>
    </div>
  );
}
