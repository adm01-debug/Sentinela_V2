import { MessageCircle, Settings, Send } from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function WhatsAppIntegrationPage() {
  const { data: templates, isLoading } = useQuery({
    queryKey: ['whatsapp-templates'],
    queryFn: async () => {
      const { data, error } = await supabase.from('message_templates').select('*').eq('channel', 'whatsapp').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div className="p-6"><Skeleton className="h-96" /></div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold flex items-center gap-2"><MessageCircle className="h-6 w-6 text-green-500" />Integração WhatsApp</h1><p className="text-muted-foreground mt-1">Configure mensagens e alertas via WhatsApp</p></div>
        <Button><Settings className="mr-2 h-4 w-4" />Configurar</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-4 text-center"><MessageCircle className="h-5 w-5 mx-auto text-green-500" /><p className="text-2xl font-bold mt-1">{templates?.length || 0}</p><p className="text-xs text-muted-foreground">Templates</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><Send className="h-5 w-5 mx-auto text-blue-500" /><p className="text-2xl font-bold mt-1">{templates?.filter(t: Record<string, unknown> => t.is_active).length || 0}</p><p className="text-xs text-muted-foreground">Ativos</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><Settings className="h-5 w-5 mx-auto text-muted-foreground" /><p className="text-2xl font-bold mt-1">API</p><p className="text-xs text-muted-foreground">WhatsApp Business</p></CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle>Templates de Mensagem</CardTitle></CardHeader><CardContent>
        {(templates || []).length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">Nenhum template WhatsApp configurado.</p>
        ) : (
          <div className="space-y-3">
            {templates?.map(t: Record<string, unknown> => (
              <div key={t.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div><p className="font-medium">{t.name}</p><p className="text-sm text-muted-foreground truncate max-w-md">{t.body.slice(0, 80)}...</p></div>
                <div className="flex gap-2"><Badge variant={t.is_active ? 'default' : 'secondary'}>{t.is_active ? 'Ativo' : 'Inativo'}</Badge><Badge variant="outline">{t.template_type}</Badge></div>
              </div>
            ))}
          </div>
        )}
      </CardContent></Card>
    </div>
  );
}

export { WhatsAppIntegrationPage };
