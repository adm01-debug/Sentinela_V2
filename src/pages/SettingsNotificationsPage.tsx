import { Switch } from '@/components/ui/Switch';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Bell, Mail, MessageSquare, AlertTriangle } from 'lucide-react';
import { useNotificationSettings, useUpdateNotificationSettings } from '@/hooks/useSettings';

export default function SettingsNotificationsPage() {
  const { data: settings } = useNotificationSettings();
  const update = useUpdateNotificationSettings();

  const handleToggle = (key: string, value: boolean) => {
    update.mutate({ [key]: value });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" />Notificações Push</CardTitle>
          <CardDescription>Receba notificações no navegador</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between"><div><p className="font-medium">Novos alertas</p><p className="text-sm text-muted-foreground">Receba notificações de alertas críticos</p></div><Switch checked={settings?.pushAlerts} onCheckedChange={v => handleToggle('pushAlerts', v)} /></div>
          <div className="flex items-center justify-between"><div><p className="font-medium">Relatórios prontos</p><p className="text-sm text-muted-foreground">Avise quando relatórios forem gerados</p></div><Switch checked={settings?.pushReports} onCheckedChange={v => handleToggle('pushReports', v)} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5" />Notificações por Email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between"><div><p className="font-medium">Resumo diário</p></div><Switch checked={settings?.emailDaily} onCheckedChange={v => handleToggle('emailDaily', v)} /></div>
          <div className="flex items-center justify-between"><div><p className="font-medium">Resumo semanal</p></div><Switch checked={settings?.emailWeekly} onCheckedChange={v => handleToggle('emailWeekly', v)} /></div>
          <div className="flex items-center justify-between"><div><p className="font-medium">Alertas críticos</p></div><Switch checked={settings?.emailCritical} onCheckedChange={v => handleToggle('emailCritical', v)} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5" />Integrações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between"><div><p className="font-medium">Slack</p><p className="text-sm text-muted-foreground">Enviar alertas para canal do Slack</p></div><Switch checked={settings?.slackEnabled} onCheckedChange={v => handleToggle('slackEnabled', v)} /></div>
          <div className="flex items-center justify-between"><div><p className="font-medium">Microsoft Teams</p></div><Switch checked={settings?.teamsEnabled} onCheckedChange={v => handleToggle('teamsEnabled', v)} /></div>
        </CardContent>
      </Card>
    </div>
  );
}