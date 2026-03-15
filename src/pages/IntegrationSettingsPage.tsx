import { Plug, Key, Database, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const ITEMS = [
  { name: 'Chaves de API', desc: 'Gerencie chaves de API', icon: Key, path: '/settings/api', status: 'configured' },
  { name: 'Webhooks', desc: 'Configure endpoints', icon: Globe, path: '/integrations/webhooks', status: 'available' },
  { name: 'WhatsApp', desc: 'Alertas via WhatsApp', icon: Plug, path: '/integrations/whatsapp', status: 'available' },
  { name: 'Banco de Dados', desc: 'Backend e armazenamento', icon: Database, path: '/settings', status: 'configured' },
];

export default function IntegrationSettingsPage() {
  const navigate = useNavigate();
  return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-2xl font-bold flex items-center gap-2"><Plug className="h-6 w-6 text-primary" />Integrações</h1><p className="text-muted-foreground mt-1">Gerencie conexões do sistema</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ITEMS.map(item => (
          <Card key={item.name} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2"><div className="flex items-center justify-between"><CardTitle className="text-base flex items-center gap-2"><item.icon className="h-5 w-5 text-primary" />{item.name}</CardTitle><Badge variant={item.status === 'configured' ? 'default' : 'outline'}>{item.status === 'configured' ? 'Configurado' : 'Disponível'}</Badge></div></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground mb-3">{item.desc}</p><Button variant="outline" size="sm" onClick={() => navigate(item.path)}>Gerenciar</Button></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
export { IntegrationSettingsPage };
