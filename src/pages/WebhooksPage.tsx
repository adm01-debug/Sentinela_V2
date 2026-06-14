import { Webhook, Plus, ExternalLink, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/PageHeader';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

export default function WebhooksPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');

  const { data: webhooks, isLoading } = useQuery({
    queryKey: ['webhooks'],
    queryFn: async () => {
      const { data, error } = await supabase.from('monitoring_settings').select('*').eq('setting_key', 'webhook').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div className="p-6"><Skeleton className="h-96" /></div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Webhooks"
        description="Configure webhooks para notificações automáticas"
        showBackButton={false}
        actions={
          <Button onClick={() => setIsOpen(true)} className="h-9 gap-2">
            <Plus className="h-4 w-4" />
            Novo Webhook
          </Button>
        }
      />

      {(webhooks || []).length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground"><Webhook className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>Nenhum webhook configurado.</p><p className="text-sm mt-1">Webhooks permitem notificar sistemas externos automaticamente.</p></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {webhooks?.map((w) => (
            <Card key={w.id}><CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3"><ExternalLink className="h-5 w-5 text-muted-foreground" /><div><p className="font-medium">{w.setting_key}</p><p className="text-sm text-muted-foreground">{w.description}</p></div></div>
              <Badge variant="default">Ativo</Badge>
            </CardContent></Card>
          ))}
        </div>
      )}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo Webhook</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Nome</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="Meu Webhook" /></div>
            <div><Label>URL</Label><Input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button><Button disabled={!url || !name}>Criar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export { WebhooksPage };
