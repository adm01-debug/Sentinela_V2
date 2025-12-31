import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Shield, 
  Search, 
  Save,
  AlertTriangle,
  Users,
  FileText,
  MapPin,
  Settings,
  Lock,
  LayoutDashboard,
  AlertCircle,
} from 'lucide-react';
import {
  usePermissionsList,
  useRolesList,
  useRolesWithPermissions,
  useToggleRolePermission,
  Permission,
  RoleWithPermissions,
} from '@/hooks/useGranularPermissions';

const MODULE_ICONS: Record<string, React.ReactNode> = {
  employees: <Users className="h-4 w-4" />,
  teams: <Users className="h-4 w-4" />,
  reports: <FileText className="h-4 w-4" />,
  violations: <AlertTriangle className="h-4 w-4" />,
  geofences: <MapPin className="h-4 w-4" />,
  settings: <Settings className="h-4 w-4" />,
  security: <Lock className="h-4 w-4" />,
  users: <Users className="h-4 w-4" />,
  roles: <Shield className="h-4 w-4" />,
  dashboard: <LayoutDashboard className="h-4 w-4" />,
};

const MODULE_LABELS: Record<string, string> = {
  employees: 'Funcionários',
  teams: 'Equipes',
  reports: 'Relatórios',
  violations: 'Violações',
  geofences: 'Geofences',
  settings: 'Configurações',
  security: 'Segurança',
  users: 'Usuários',
  roles: 'Roles',
  dashboard: 'Dashboard',
};

const ACTION_LABELS: Record<string, string> = {
  view: 'Visualizar',
  create: 'Criar',
  edit: 'Editar',
  delete: 'Excluir',
  manage: 'Gerenciar',
  export: 'Exportar',
  dismiss: 'Dispensar',
  analytics: 'Analytics',
};

export function PermissionMatrix() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  const { data: permissions = [], isLoading: permissionsLoading } = usePermissionsList();
  const { data: rolesWithPermissions = [], isLoading: rolesLoading } = useRolesWithPermissions();
  const togglePermission = useToggleRolePermission();

  const isLoading = permissionsLoading || rolesLoading;

  // Group permissions by module
  const permissionsByModule = useMemo(() => {
    return permissions.reduce((acc, perm) => {
      if (!acc[perm.module]) {
        acc[perm.module] = [];
      }
      acc[perm.module].push(perm);
      return acc;
    }, {} as Record<string, Permission[]>);
  }, [permissions]);

  const modules = Object.keys(permissionsByModule).sort();

  // Filter permissions based on search and selected module
  const filteredPermissions = useMemo(() => {
    let filtered = permissions;

    if (selectedModule) {
      filtered = filtered.filter(p => p.module === selectedModule);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        p =>
          p.name.toLowerCase().includes(term) ||
          p.module.toLowerCase().includes(term) ||
          p.description?.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [permissions, selectedModule, searchTerm]);

  const hasPermission = (role: RoleWithPermissions, permissionId: string) => {
    return role.permissions.some(p => p.id === permissionId);
  };

  const handleTogglePermission = (roleId: string, permissionId: string, currentlyEnabled: boolean) => {
    togglePermission.mutate({
      roleId,
      permissionId,
      enabled: !currentlyEnabled,
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Matriz de Permissões
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Matriz de Permissões
        </CardTitle>
        <CardDescription>
          Configure as permissões granulares para cada role do sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar permissões..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedModule === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedModule(null)}
            >
              Todos
            </Button>
            {modules.map(module => (
              <Button
                key={module}
                variant={selectedModule === module ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedModule(module)}
                className="gap-1"
              >
                {MODULE_ICONS[module]}
                {MODULE_LABELS[module] || module}
              </Button>
            ))}
          </div>
        </div>

        {/* Matrix Table */}
        <ScrollArea className="h-[500px] rounded-md border">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead className="w-[250px]">Permissão</TableHead>
                {rolesWithPermissions.map(role => (
                  <TableHead key={role.id} className="text-center min-w-[100px]">
                    <div className="flex flex-col items-center gap-1">
                      <span>{role.name}</span>
                      {role.is_system && (
                        <Badge variant="secondary" className="text-xs">
                          Sistema
                        </Badge>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPermissions.map(permission => (
                <TableRow key={permission.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {MODULE_ICONS[permission.module]}
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {MODULE_LABELS[permission.module] || permission.module}
                          </Badge>
                          <span>{ACTION_LABELS[permission.action] || permission.action}</span>
                        </div>
                        {permission.description && (
                          <p className="text-xs text-muted-foreground">
                            {permission.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  {rolesWithPermissions.map(role => {
                    const enabled = hasPermission(role, permission.id);
                    return (
                      <TableCell key={role.id} className="text-center">
                        <Checkbox
                          checked={enabled}
                          onCheckedChange={() =>
                            handleTogglePermission(role.id, permission.id, enabled)
                          }
                          disabled={togglePermission.isPending}
                        />
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>

        {filteredPermissions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <AlertCircle className="h-8 w-8 mb-2" />
            <p>Nenhuma permissão encontrada</p>
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground border-t pt-4">
          <div className="flex items-center gap-2">
            <Checkbox checked disabled />
            <span>Permissão concedida</span>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox disabled />
            <span>Permissão negada</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">Sistema</Badge>
            <span>Role do sistema (não pode ser excluído)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
