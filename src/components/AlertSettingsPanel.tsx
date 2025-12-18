import React, { useState } from 'react';
import { Mail, Plus, X, Bell, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAlertSettings } from '@/hooks/useAlertSettings';

export function AlertSettingsPanel() {
  const { settings, loading, updateSettings, addEmail, removeEmail, testNotification } = useAlertSettings();
  const [newEmail, setNewEmail] = useState('');
  const [adding, setAdding] = useState(false);
  const [testing, setTesting] = useState(false);

  const handleAddEmail = async () => {
    if (!newEmail.trim()) return;
    setAdding(true);
    const success = await addEmail(newEmail.trim());
    if (success) setNewEmail('');
    setAdding(false);
  };

  const handleTest = async () => {
    setTesting(true);
    await testNotification();
    setTesting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enable/Disable */}
      <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
        <div className="flex items-center gap-3">
          <Bell className="h-5 w-5 text-primary" />
          <div>
            <p className="font-medium">Alertas por Email</p>
            <p className="text-sm text-muted-foreground">
              Receba notificações por email quando violações forem detectadas
            </p>
          </div>
        </div>
        <Switch
          checked={settings?.enabled ?? true}
          onCheckedChange={(checked) => updateSettings({ enabled: checked })}
        />
      </div>

      {/* Severity Filters */}
      <div className="p-4 rounded-lg border border-border bg-card space-y-4">
        <h3 className="font-medium">Notificar por Severidade</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="notify-critical"
              checked={settings?.notify_critical ?? true}
              onCheckedChange={(checked) => updateSettings({ notify_critical: checked })}
            />
            <Label htmlFor="notify-critical" className="flex items-center gap-2">
              <Badge variant="destructive" className="text-xs">Crítica</Badge>
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="notify-high"
              checked={settings?.notify_high ?? true}
              onCheckedChange={(checked) => updateSettings({ notify_high: checked })}
            />
            <Label htmlFor="notify-high" className="flex items-center gap-2">
              <Badge className="bg-orange-500 text-xs">Alta</Badge>
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="notify-medium"
              checked={settings?.notify_medium ?? false}
              onCheckedChange={(checked) => updateSettings({ notify_medium: checked })}
            />
            <Label htmlFor="notify-medium" className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">Média</Badge>
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="notify-low"
              checked={settings?.notify_low ?? false}
              onCheckedChange={(checked) => updateSettings({ notify_low: checked })}
            />
            <Label htmlFor="notify-low" className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">Baixa</Badge>
            </Label>
          </div>
        </div>
      </div>

      {/* Email Recipients */}
      <div className="p-4 rounded-lg border border-border bg-card space-y-4">
        <h3 className="font-medium flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Destinatários
        </h3>
        
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="email@exemplo.com"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddEmail()}
            className="flex-1"
          />
          <Button onClick={handleAddEmail} disabled={adding || !newEmail.trim()}>
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          </Button>
        </div>

        {settings?.recipient_emails && settings.recipient_emails.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {settings.recipient_emails.map((email) => (
              <Badge key={email} variant="secondary" className="pl-3 pr-1 py-1.5 gap-2">
                {email}
                <button
                  onClick={() => removeEmail(email)}
                  className="hover:bg-destructive/20 rounded p-0.5 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Nenhum destinatário configurado. Adicione emails para receber alertas.
          </p>
        )}
      </div>

      {/* Test Button */}
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          onClick={handleTest} 
          disabled={testing || !settings?.recipient_emails?.length}
          className="gap-2"
        >
          {testing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          Enviar Teste
        </Button>
      </div>
    </div>
  );
}
