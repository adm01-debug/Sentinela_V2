import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Shield,
  Save,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Users,
  FileText,
  MapPin,
  Settings,
  Lock,
  LayoutDashboard,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import {
  usePermissionsList,
  useRolesList,
  useRolePermissions,
  useBulkUpdateRolePermissions,
  Permission,
  Role,
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

export function RolePermissionsEditor() {
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [hasChanges, setHasChanges] = useState(false);

  const { data: roles = [], isLoading: rolesLoading } = useRolesList();
  const { data: permissions = [], isLoading: permissionsLoading } = usePermissionsList();
  const { data: rolePermissions = [], isLoading: rolePermissionsLoading } = useRolePermissions(selectedRoleId);
  const bulkUpdate = useBulkUpdateRolePermissions();

  const selectedRole = roles.find(r => r.id === selectedRoleId);

  // Initialize selected permissions when role changes
  useEffect(() => {
    if (rolePermissions.length > 0) {
      const permIds = new Set<string>(rolePermissions.map((rp: any) => rp.permission_id as string));
      setSelectedPermissions(permIds);
      setHasChanges(false);
    } else if (selectedRoleId) {
      setSelectedPermissions(new Set());
      setHasChanges(false);
    }
  }, [rolePermissions, selectedRoleId]);

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

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(permissionId)) {
        newSet.delete(permissionId);
      } else {
        newSet.add(permissionId);
      }
      return newSet;
    });
    setHasChanges(true);
  };

  const toggleModule = (module: string, enabled: boolean) => {
    setSelectedPermissions(prev => {
      const newSet = new Set(prev);
      const modulePerms = permissionsByModule[module] || [];
      
      modulePerms.forEach(perm => {
        if (enabled) {
          newSet.add(perm.id);
        } else {
          newSet.delete(perm.id);
        }
      });
      
      return newSet;
    });
    setHasChanges(true);
  };

  const isModuleFullySelected = (module: string) => {
    const modulePerms = permissionsByModule[module] || [];
    return modulePerms.every(p => selectedPermissions.has(p.id));
  };

  const isModulePartiallySelected = (module: string) => {
    const modulePerms = permissionsByModule[module] || [];
    const selectedCount = modulePerms.filter(p => selectedPermissions.has(p.id)).length;
    return selectedCount > 0 && selectedCount < modulePerms.length;
  };

  const getModuleStats = (module: string) => {
    const modulePerms = permissionsByModule[module] || [];
    const selectedCount = modulePerms.filter(p => selectedPermissions.has(p.id)).length;
    return `${selectedCount}/${modulePerms.length}`;
  };

  const handleSave = () => {
    if (!selectedRoleId) return;
    bulkUpdate.mutate(
      { roleId: selectedRoleId, permissionIds: Array.from(selectedPermissions) },
      { onSuccess: () => setHasChanges(false) }
    );
  };

  const handleReset = () => {
    if (rolePermissions.length > 0) {
      const permIds = new Set<string>(rolePermissions.map((rp: { permission_id: string }) => rp.permission_id));
      setSelectedPermissions(permIds);
    } else {
      setSelectedPermissions(new Set<string>());
    }
    setHasChanges(false);
  };

  const selectAll = () => {
    setSelectedPermissions(new Set(permissions.map(p => p.id)));
    setHasChanges(true);
  };

  const clearAll = () => {
    setSelectedPermissions(new Set());
    setHasChanges(true);
  };

  const isLoading = rolesLoading || permissionsLoading;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Editar Permissões por Role
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
          Editar Permissões por Role
        </CardTitle>
        <CardDescription>
          Selecione um role e configure suas permissões granulares
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Role Selector */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="flex-1 space-y-2">
            <Label>Selecione o Role</Label>
            <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Escolha um role para editar" />
              </SelectTrigger>
              <SelectContent>
                {roles.map(role => (
                  <SelectItem key={role.id} value={role.id}>
                    <div className="flex items-center gap-2">
                      {role.name}
                      {role.is_system && (
                        <Badge variant="secondary" className="text-xs">Sistema</Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedRoleId && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={selectAll}>
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Selecionar Todos
              </Button>
              <Button variant="outline" size="sm" onClick={clearAll}>
                <XCircle className="h-4 w-4 mr-1" />
                Limpar Todos
              </Button>
            </div>
          )}
        </div>

        {/* Role Info */}
        {selectedRole && (
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">{selectedRole.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedRole.description || 'Sem descrição'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {selectedPermissions.size} permissões selecionadas
              </Badge>
              {hasChanges && (
                <Badge variant="default" className="bg-amber-500">
                  Alterações não salvas
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Permissions by Module */}
        {selectedRoleId && (
          <>
            {rolePermissionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                <Accordion type="multiple" defaultValue={modules} className="space-y-2">
                  {modules.map(module => (
                    <AccordionItem key={module} value={module} className="border rounded-lg px-4">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center justify-between w-full pr-4">
                          <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded bg-primary/10">
                              {MODULE_ICONS[module]}
                            </div>
                            <span className="font-medium">
                              {MODULE_LABELS[module] || module}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge 
                              variant={isModuleFullySelected(module) ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {getModuleStats(module)}
                            </Badge>
                            <div onClick={e => e.stopPropagation()}>
                              <Switch
                                checked={isModuleFullySelected(module)}
                                onCheckedChange={checked => toggleModule(module, checked)}
                                className="data-[state=checked]:bg-primary"
                              />
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="grid gap-3 py-2">
                          {permissionsByModule[module].map(permission => (
                            <div
                              key={permission.id}
                              className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <Checkbox
                                  id={permission.id}
                                  checked={selectedPermissions.has(permission.id)}
                                  onCheckedChange={() => togglePermission(permission.id)}
                                />
                                <div>
                                  <Label 
                                    htmlFor={permission.id}
                                    className="font-medium cursor-pointer"
                                  >
                                    {ACTION_LABELS[permission.action] || permission.action}
                                  </Label>
                                  {permission.description && (
                                    <p className="text-xs text-muted-foreground">
                                      {permission.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {permission.name}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </ScrollArea>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={!hasChanges || bulkUpdate.isPending}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Desfazer Alterações
              </Button>
              <Button
                onClick={handleSave}
                disabled={!hasChanges || bulkUpdate.isPending}
              >
                {bulkUpdate.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Salvar Permissões
              </Button>
            </div>
          </>
        )}

        {!selectedRoleId && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Shield className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">Nenhum role selecionado</p>
            <p className="text-sm">Selecione um role acima para editar suas permissões</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
