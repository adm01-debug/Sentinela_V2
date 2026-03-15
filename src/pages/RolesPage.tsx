import { Shield, Plus, Edit, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const SYSTEM_ROLES = [
  { name: 'Admin', description: 'Acesso total ao sistema, incluindo configurações e gestão de usuários', permissions: ['*'], users: 0 },
  { name: 'Manager', description: 'Gerencia funcionários, visualiza relatórios e monitoramento', permissions: ['read', 'write'], users: 0 },
  { name: 'Analyst', description: 'Acesso a relatórios, analytics e dados de produtividade', permissions: ['read'], users: 0 },
  { name: 'Viewer', description: 'Visualização limitada de dados e dashboards', permissions: ['read'], users: 0 },
];

export default function RolesPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold flex items-center gap-2"><Shield className="h-6 w-6 text-primary" />Funções e Permissões</h1><p className="text-muted-foreground mt-1">Configure funções e permissões de acesso</p></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SYSTEM_ROLES.map(role => (
          <Card key={role.name}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4" />{role.name}</CardTitle>
                <Badge variant="outline"><Users className="h-3 w-3 mr-1" />{role.users} usuários</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">{role.description}</p>
              <div className="flex gap-1 flex-wrap">
                {role.permissions.map(p => <Badge key={p} variant="secondary" className="text-xs">{p === '*' ? 'Acesso Total' : p}</Badge>)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export { RolesPage };
