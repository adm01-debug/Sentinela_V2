import { Shield, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useRoles } from '@/hooks/useRoles';

export default function RolesPage() {
  const { roles, isLoading } = useRoles();

  if (isLoading) return <div className="p-6 space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}</div>;

  const displayRoles = roles.length > 0 ? roles : [
    { id: '1', name: 'Admin', description: 'Acesso total ao sistema', permissions: ['*'], userCount: 0, is_active: true, created_at: '' },
    { id: '2', name: 'Manager', description: 'Gerencia funcionários e relatórios', permissions: ['read', 'write'], userCount: 0, is_active: true, created_at: '' },
    { id: '3', name: 'Analyst', description: 'Acesso a relatórios e analytics', permissions: ['read'], userCount: 0, is_active: true, created_at: '' },
    { id: '4', name: 'Viewer', description: 'Visualização limitada', permissions: ['read'], userCount: 0, is_active: true, created_at: '' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold flex items-center gap-2"><Shield className="h-6 w-6 text-primary" />Funções e Permissões</h1><p className="text-muted-foreground mt-1">Configure funções e permissões de acesso</p></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayRoles.map(role => (
          <Card key={role.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4" />{role.name}</CardTitle>
                <Badge variant="outline"><Users className="h-3 w-3 mr-1" />{role.userCount} usuários</Badge>
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
