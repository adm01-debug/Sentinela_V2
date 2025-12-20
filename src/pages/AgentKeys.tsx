import React, { Suspense, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useAgentKeysPage } from '@/hooks/useAgentKeysPage';
import { AgentKeyCard, AgentKeyStats } from '@/components/agent-keys';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Plus, Search, Key, Copy, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <Card className="border-destructive">
      <CardContent className="pt-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-destructive">Erro ao carregar chaves</h3>
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
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
    </div>
  );
}

const AgentKeysContent = React.memo(function AgentKeysContent() {
  const {
    keys,
    stats,
    search,
    statusFilter,
    selectedKey,
    isCreateDialogOpen,
    isDetailsOpen,
    isLoading,
    handleSearchChange,
    handleStatusFilterChange,
    handleOpenCreateDialog,
    handleCloseCreateDialog,
    handleCreateKey,
    handleViewDetails,
    handleCloseDetails,
    handleRevokeKey,
    handleReactivateKey,
    handleDeleteKey,
    handleCopyKey,
    isCreating,
    isDeleting,
  } = useAgentKeysPage();

  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyDescription, setNewKeyDescription] = useState('');
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  const handleSubmitCreate = async () => {
    const key = await handleCreateKey({ name: newKeyName, description: newKeyDescription });
    if (key) {
      setCreatedKey(key);
      setNewKeyName('');
      setNewKeyDescription('');
    }
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <AgentKeyStats {...stats} />

      {/* Filters & Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar chaves..."
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="active">Ativas</SelectItem>
                <SelectItem value="inactive">Revogadas</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleOpenCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Chave
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Keys Grid */}
      {keys.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma chave encontrada</p>
              <Button className="mt-4" onClick={handleOpenCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Criar primeira chave
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {keys.map((key) => (
            <AgentKeyCard
              key={key.id}
              agentKey={key}
              onViewDetails={handleViewDetails}
              onCopy={handleCopyKey}
              onRevoke={handleRevokeKey}
              onReactivate={handleReactivateKey}
            />
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={handleCloseCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Chave de API</DialogTitle>
            <DialogDescription>
              Crie uma nova chave para autenticar o Desktop Agent
            </DialogDescription>
          </DialogHeader>
          
          {createdKey ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800 mb-2">Chave criada com sucesso!</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 bg-white rounded text-sm font-mono break-all">
                    {createdKey}
                  </code>
                  <Button size="icon" variant="outline" onClick={() => handleCopyKey(createdKey)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-green-700 mt-2">
                  Copie esta chave agora. Por segurança, ela não será exibida novamente.
                </p>
              </div>
              <DialogFooter>
                <Button onClick={() => { setCreatedKey(null); handleCloseCreateDialog(); }}>
                  Fechar
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  placeholder="Ex: Produção, Desenvolvimento..."
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Textarea
                  id="description"
                  placeholder="Para que será usada esta chave?"
                  value={newKeyDescription}
                  onChange={(e) => setNewKeyDescription(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleCloseCreateDialog}>Cancelar</Button>
                <Button onClick={handleSubmitCreate} disabled={!newKeyName || isCreating}>
                  {isCreating ? 'Criando...' : 'Criar Chave'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={handleCloseDetails}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes da Chave</DialogTitle>
          </DialogHeader>
          
          {selectedKey && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nome</label>
                  <p className="font-medium">{selectedKey.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div>
                    <Badge variant={selectedKey.is_active ? 'default' : 'secondary'}>
                      {selectedKey.is_active ? 'Ativa' : 'Revogada'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Criada em</label>
                  <p>{format(new Date(selectedKey.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Usos</label>
                  <p>{selectedKey.usage_count}</p>
                </div>
              </div>
              
              {selectedKey.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Descrição</label>
                  <p>{selectedKey.description}</p>
                </div>
              )}
              
              <div className="pt-4 border-t flex justify-between">
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteKey(selectedKey.id)}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remover
                </Button>
                
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleCopyKey(selectedKey.key)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar
                  </Button>
                  {selectedKey.is_active ? (
                    <Button variant="outline" onClick={() => handleRevokeKey(selectedKey.id)}>
                      Revogar
                    </Button>
                  ) : (
                    <Button onClick={() => handleReactivateKey(selectedKey.id)}>
                      Reativar
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
});

export default function AgentKeys() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chaves de API</h1>
          <p className="text-muted-foreground">
            Gerencie as chaves de autenticação do Desktop Agent
          </p>
        </div>
      </div>

      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<LoadingSkeleton />}>
          <AgentKeysContent />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
