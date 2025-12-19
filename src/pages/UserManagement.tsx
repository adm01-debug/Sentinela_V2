import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Users, 
  Shield, 
  Search, 
  Loader2,
  UserCog,
  Crown,
  Eye,
  Briefcase,
  Building2
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions, UserRole } from '@/hooks/usePermissions';
import { PermissionGate } from '@/components/PermissionGate';
import { toast } from 'sonner';

interface UserWithRole {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole | null;
  created_at: string;
}

const roleConfig: Record<UserRole, { label: string; color: string; icon: any }> = {
  viewer: { label: 'Visualizador', color: 'bg-gray-500', icon: Eye },
  supervisor: { label: 'Supervisor', color: 'bg-blue-500', icon: Briefcase },
  manager: { label: 'Gerente', color: 'bg-purple-500', icon: Building2 },
  admin: { label: 'Administrador', color: 'bg-orange-500', icon: UserCog },
  super_admin: { label: 'Super Admin', color: 'bg-red-500', icon: Crown },
};

async function fetchUsersWithRoles(): Promise<UserWithRole[]> {
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, email, full_name, created_at');

  if (profilesError) throw profilesError;

  const { data: roles, error: rolesError } = await supabase
    .from('user_roles')
    .select('user_id, role');

  if (rolesError) throw rolesError;

  const rolesMap = new Map(roles?.map(r => [r.user_id, r.role]) || []);

  return (profiles || []).map(p => ({
    ...p,
    role: rolesMap.get(p.id) as UserRole | null,
  }));
}

export default function UserManagement() {
  const queryClient = useQueryClient();
  const { isSuperAdmin } = usePermissions();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [newRole, setNewRole] = useState<UserRole | ''>('');

  const { data: users, isLoading } = useQuery({
    queryKey: ['users-with-roles'],
    queryFn: fetchUsersWithRoles,
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: UserRole }) => {
      // Verificar se já existe role
      const { data: existing } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (existing) {
        const { error } = await supabase
          .from('user_roles')
          .update({ role })
          .eq('user_id', userId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      toast.success('Role atualizada com sucesso!');
      setSelectedUser(null);
      setNewRole('');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar role: ' + error.message);
    },
  });

  const filteredUsers = users?.filter(u =>
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className="pl-64">
          <Header />
          <main className="p-6 flex items-center justify-center min-h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="pl-64">
        <Header />
        <main className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Gerenciamento de Usuários</h1>
              <p className="text-muted-foreground">Gerencie roles e permissões dos usuários</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {Object.entries(roleConfig).map(([role, config]) => {
              const count = users?.filter(u => u.role === role).length || 0;
              const Icon = config.icon;
              return (
                <Card key={role}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{config.label}</CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{count}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por email ou nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Users List */}
          <Card>
            <CardHeader>
              <CardTitle>Usuários ({filteredUsers.length})</CardTitle>
              <CardDescription>Clique em um usuário para alterar sua role</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredUsers.map(user => {
                  const roleInfo = user.role ? roleConfig[user.role] : null;
                  const Icon = roleInfo?.icon || Eye;
                  
                  return (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                      onClick={() => {
                        setSelectedUser(user);
                        setNewRole(user.role || '');
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{user.full_name || user.email}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                      <Badge className={roleInfo?.color || 'bg-gray-300'}>
                        {roleInfo?.label || 'Sem role'}
                      </Badge>
                    </div>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum usuário encontrado
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Edit Role Dialog */}
          <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Alterar Role</DialogTitle>
                <DialogDescription>
                  Alterar role do usuário {selectedUser?.email}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nova Role</label>
                  <Select value={newRole} onValueChange={(v) => setNewRole(v as UserRole)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma role" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(roleConfig).map(([role, config]) => (
                        <SelectItem key={role} value={role}>
                          <div className="flex items-center gap-2">
                            <config.icon className="h-4 w-4" />
                            {config.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {newRole && (
                  <div className="p-3 rounded-lg bg-muted">
                    <h4 className="font-medium mb-2">Permissões da role:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {newRole === 'viewer' && <li>• Apenas visualização de dados básicos</li>}
                      {newRole === 'supervisor' && (
                        <>
                          <li>• Visualização de funcionários e monitoramento</li>
                          <li>• Exportação de relatórios</li>
                        </>
                      )}
                      {newRole === 'manager' && (
                        <>
                          <li>• Gerenciar funcionários da sua equipe</li>
                          <li>• Criar e editar jornadas de trabalho</li>
                          <li>• Visualizar e tratar violações</li>
                        </>
                      )}
                      {newRole === 'admin' && (
                        <>
                          <li>• Acesso completo a quase todos os módulos</li>
                          <li>• Gerenciar regras de violação e webhooks</li>
                          <li>• Sem acesso a configurações críticas</li>
                        </>
                      )}
                      {newRole === 'super_admin' && (
                        <>
                          <li>• Acesso total ao sistema</li>
                          <li>• Gerenciar usuários e permissões</li>
                          <li>• Configurações críticas de segurança</li>
                        </>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedUser(null)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    if (selectedUser && newRole) {
                      updateRoleMutation.mutate({ userId: selectedUser.id, role: newRole as UserRole });
                    }
                  }}
                  disabled={!newRole || updateRoleMutation.isPending}
                >
                  {updateRoleMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}
