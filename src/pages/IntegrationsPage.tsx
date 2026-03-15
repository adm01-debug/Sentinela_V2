import { Plug, Webhook, MessageCircle, Mail, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const INTEGRATIONS = [
  { name: 'Webhooks', description: 'Envie notificações para sistemas externos via HTTP', icon: Webhook, path: '/integrations/webhooks', status: 'available' },
  { name: 'WhatsApp Business', description: 'Alertas e notificações via WhatsApp', icon: MessageCircle, path: '/integrations/whatsapp', status: 'available' },
  { name: 'Email (Resend)', description: 'Notificações por email para alertas críticos', icon: Mail, path: '/settings/notifications', status: 'configured' },
  { name: 'Push Notifications', description: 'Notificações push no navegador', icon: Bell, path: '/settings/notifications', status: 'available' },
];

export default function IntegrationsPage() {
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-2xl font-bold flex items-center gap-2"><Plug className="h-6 w-6 text-primary" />Integrações</h1><p className="text-muted-foreground mt-1">Configure integrações com serviços externos</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {INTEGRATIONS.map(integration => (
          <Card key={integration.name} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2"><integration.icon className="h-5 w-5 text-primary" />{integration.name}</CardTitle>
                <Badge variant={integration.status === 'configured' ? 'default' : 'outline'}>{integration.status === 'configured' ? 'Configurado' : 'Disponível'}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">{integration.description}</p>
              <Button variant="outline" size="sm" onClick={() => navigate(integration.path)}>Configurar</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export { IntegrationsPage };
