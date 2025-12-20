import React, { Suspense, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useUserManagementPage } from '@/hooks/useUserManagementPage';
import { UserCard, UserStats } from '@/components/users';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Search, Users, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <Card className="border-destructive">
      <CardContent className="pt-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-destructive">Erro ao carregar usuários</h3>
          <p className="text-muted-foreground mt-2">{error.message}</p>
          <Button onClick={resetErrorBoundary} className="mt-4">Tentar novamente</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32" />)}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-40" />)}
      </div>
    </div>
  );
}

const UserManagementContent = React.memo(function UserManagementContent() {
  const {
    users, stats, search, roleFilter, statusFilter, selectedUser,
    isCreateDialogOpen, isEditDialogOpen, isLoading,
    handleSearchChange, handleRoleFilterChange, handleStatusFilterChange,
    handleOpenCreateDialog, handleCloseCreateDialog, handleCreateUser,
    handleEditUser, handleCloseEditDialog, handleUpdateUser, handleDeleteUser,
    handleResetPassword, handleToggleStatus,
    isCreating, isUpdating, isDeleting,
  } = useUserManagementPage();

  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'viewer' as const });

  const handleSubmitCreate = () => {
    handleCreateUser(formData);
    setFormData({ name: '', email: '', password: '', role: 'viewer' });
  };

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <UserStats {...stats} />

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar usuários..." value={search} onChange={(e) => handleSearchChange(e.target.value)} className="pl-10" />
              </div>
            </div>
            
            <Select value={roleFilter} onValueChange={handleRoleFilterChange}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Função" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="manager">Gerente</SelectItem>
                <SelectItem value="viewer">Visualizador</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleOpenCreateDialog}><Plus className="h-4 w-4 mr-2" />Novo Usuário</Button>
          </div>
        </CardContent>
      </Card>

      {users.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum usuário encontrado</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <UserCard key={user.id} user={user} onEdit={handleEditUser} onResetPassword={handleResetPassword} onToggleStatus={handleToggleStatus} />
          ))}
        </div>
      )}

      <Dialog open={isCreateDialogOpen} onOpenChange={handleCloseCreateDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo Usuário</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Senha</Label>
              <Input type="password" value={formData.password} onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Função</Label>
              <Select value={formData.role} onValueChange={(v) => setFormData(p => ({ ...p, role: v as any }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="manager">Gerente</SelectItem>
                  <SelectItem value="viewer">Visualizador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseCreateDialog}>Cancelar</Button>
            <Button onClick={handleSubmitCreate} disabled={isCreating}>{isCreating ? 'Criando...' : 'Criar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={handleCloseEditDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Usuário</DialogTitle></DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input defaultValue={selectedUser.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Função</Label>
                <Select defaultValue={selectedUser.role} onValueChange={(v) => handleUpdateUser({ id: selectedUser.id, role: v as any })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="manager">Gerente</SelectItem>
                    <SelectItem value="viewer">Visualizador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="destructive" onClick={() => selectedUser && handleDeleteUser(selectedUser.id)} disabled={isDeleting}>
              <Trash2 className="h-4 w-4 mr-2" />Remover
            </Button>
            <Button variant="outline" onClick={handleCloseEditDialog}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});

export default function UserManagement() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Usuários</h1>
        <p className="text-muted-foreground">Gerencie os usuários do sistema</p>
      </div>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<LoadingSkeleton />}><UserManagementContent /></Suspense>
      </ErrorBoundary>
    </div>
  );
}
