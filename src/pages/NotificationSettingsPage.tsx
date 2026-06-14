import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Save, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

export default function NotificationSettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useQuery({
    queryKey: ['notification-settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('alert_notification_settings').select('*').limit(1).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const [enabled, setEnabled] = useState(true);
  const [critical, setCritical] = useState(true);
  const [high, setHigh] = useState(true);
  const [medium, setMedium] = useState(false);
  const [low, setLow] = useState(false);
  const [emails, setEmails] = useState('');

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { enabled, notify_critical: critical, notify_high: high, notify_medium: medium, notify_low: low, recipient_emails: emails.split(',').map(e => e.trim()).filter(Boolean), setting_type: 'email' };
      if (settings?.id) { const { error } = await supabase.from('alert_notification_settings').update(payload).eq('id', settings.id); if (error) throw error; }
      else { const { error } = await supabase.from('alert_notification_settings').insert(payload); if (error) throw error; }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['notification-settings'] }); toast({ title: 'Salvo!' }); },
    onError: (e: Error) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });

  if (isLoading) return <div className="p-6"><Skeleton className="h-96" /></div>;

  return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-2xl font-bold flex items-center gap-2"><Bell className="h-6 w-6 text-primary" />Notificações</h1><p className="text-muted-foreground mt-1">Configure alertas por email</p></div>
      <Card><CardHeader><CardTitle>Email</CardTitle></CardHeader><CardContent className="space-y-4">
        <div className="flex items-center justify-between"><Label>Habilitado</Label><Switch checked={enabled} onCheckedChange={setEnabled} /></div>
        <div className="flex items-center justify-between"><Label>Crítica</Label><Switch checked={critical} onCheckedChange={setCritical} /></div>
        <div className="flex items-center justify-between"><Label>Alta</Label><Switch checked={high} onCheckedChange={setHigh} /></div>
        <div className="flex items-center justify-between"><Label>Média</Label><Switch checked={medium} onCheckedChange={setMedium} /></div>
        <div className="flex items-center justify-between"><Label>Baixa</Label><Switch checked={low} onCheckedChange={setLow} /></div>
        <div><Label>Emails</Label><Input value={emails} onChange={e => setEmails(e.target.value)} placeholder="email@example.com" /></div>
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>{saveMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Salvar</Button>
      </CardContent></Card>
    </div>
  );
}
export { NotificationSettingsPage };
