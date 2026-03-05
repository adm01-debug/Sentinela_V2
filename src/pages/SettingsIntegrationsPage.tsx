import { useState } from 'react';
import { Plus, ExternalLink, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useIntegrations } from '@/hooks/useIntegrations';

const availableIntegrations = [
  { id: 'slack', name: 'Slack', description: 'Envie alertas para canais do Slack', icon: '💬' },
  { id: 'teams', name: 'Microsoft Teams', description: 'Integre com Teams', icon: '👥' },
  { id: 'jira', name: 'Jira', description: 'Crie tickets automaticamente', icon: '📋' },
  { id: 'github', name: 'GitHub', description: 'Monitore atividade de desenvolvimento', icon: '🐙' },
];

export default function SettingsIntegrationsPage() {
  const [open, setOpen] = useState(false);
  const { integrations, add, remove } = useIntegrations();

  const connectedIds = integrations.map(c => c.id);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h2 className="text-xl font-bold">Integrações</h2><p className="text-muted-foreground">Conecte com suas ferramentas favoritas</p></div>
        <Button onClick={() => setOpen(true)}><Plus className="mr-2 h-4 w-4" />Adicionar</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {integrations.map(integration => (
          <Card key={integration.id}>
            <CardHeader className="flex-row items-center gap-4">
              <span className="text-3xl">{availableIntegrations.find(i => i.id === integration.id)?.icon}</span>
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2">{integration.name}<Badge variant="default"><Check className="h-3 w-3 mr-1" />Conectado</Badge></CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button variant="outline" size="sm"><ExternalLink className="mr-2 h-4 w-4" />Configurar</Button>
              <Button variant="outline" size="sm" onClick={() => remove(integration.id)}><Trash2 className="mr-2 h-4 w-4 text-destructive" />Desconectar</Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Adicionar Integração</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {availableIntegrations.filter(i => !connectedIds.includes(i.id)).map(integration => (
              <div key={integration.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{integration.icon}</span>
                  <div><p className="font-medium">{integration.name}</p><p className="text-sm text-muted-foreground">{integration.description}</p></div>
                </div>
                <Button size="sm" onClick={() => { add(integration.name); setOpen(false); }}>Conectar</Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
