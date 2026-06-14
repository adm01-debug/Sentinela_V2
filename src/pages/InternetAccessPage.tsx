import { Globe, Plus, Edit, Trash2, Search, Shield, ShieldOff, ShieldCheck } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useInternetAccessPage, URL_CATEGORIES } from '@/hooks/useInternetAccessPage';

export default function InternetAccessPage() {
  const {
    searchTerm, setSearchTerm,
    typeFilter, setTypeFilter,
    isDialogOpen, isDeleteDialogOpen, setIsDeleteDialogOpen,
    editingRule, deletingRule, setDeletingRule,
    formData, setFormData,
    rules, stats, isLoading,
    isCreating, isUpdating, isDeleting,
    handleOpenCreate, handleOpenEdit, handleCloseDialog,
    handleSubmit, handleDelete,
  } = useInternetAccessPage();

  if (isLoading) {
    return <div className="p-6 space-y-6"><Skeleton className="h-8 w-48" /><div className="grid grid-cols-1 md:grid-cols-4 gap-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-24" />)}</div><Skeleton className="h-96" /></div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Acesso à Internet"
        description="Gerencie regras de acesso a sites e aplicações web"
        showBackButton={false}
        actions={
          <Button onClick={handleOpenCreate} className="h-9 gap-2">
            <Plus className="h-4 w-4" />
            Nova Regra
          </Button>
        }
      />


      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card><CardContent className="pt-4 text-center"><Globe className="h-5 w-5 mx-auto text-primary" /><p className="text-2xl font-bold mt-1">{stats.total}</p><p className="text-xs text-muted-foreground">Total</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><ShieldCheck className="h-5 w-5 mx-auto text-green-500" /><p className="text-2xl font-bold mt-1">{stats.active}</p><p className="text-xs text-muted-foreground">Ativas</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><ShieldOff className="h-5 w-5 mx-auto text-red-500" /><p className="text-2xl font-bold mt-1">{stats.blocked}</p><p className="text-xs text-muted-foreground">Bloqueios</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><Shield className="h-5 w-5 mx-auto text-blue-500" /><p className="text-2xl font-bold mt-1">{stats.allowed}</p><p className="text-xs text-muted-foreground">Permissões</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><Globe className="h-5 w-5 mx-auto text-orange-500" /><p className="text-2xl font-bold mt-1">{stats.totalBlocks}</p><p className="text-xs text-muted-foreground">Total Bloqueados</p></CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar regras..." className="pl-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="block">Bloqueio</SelectItem>
            <SelectItem value="allow">Permissão</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Rules List */}
      {rules.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground"><Globe className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>Nenhuma regra de acesso encontrada.</p><p className="text-sm mt-1">Crie regras para controlar o acesso à internet dos funcionários.</p></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {rules.map(rule => (
            <Card key={rule.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  {rule.type === 'block' ? <ShieldOff className="h-5 w-5 text-red-500 shrink-0" /> : <ShieldCheck className="h-5 w-5 text-green-500 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium">{rule.name}</p>
                      <Badge variant={rule.type === 'block' ? 'destructive' : 'default'}>{rule.type === 'block' ? 'Bloqueio' : 'Permissão'}</Badge>
                      <Badge variant="outline">{rule.target_type}</Badge>
                      {rule.is_active && <Badge variant="secondary">Ativa</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 truncate">{rule.target_value || rule.description || 'Sem detalhes'}</p>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(rule)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => { setDeletingRule(rule); setIsDeleteDialogOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingRule ? 'Editar Regra' : 'Nova Regra de Acesso'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Nome</Label><Input value={formData.name} onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))} placeholder="Ex: Bloquear redes sociais" /></div>
            <div><Label>Descrição</Label><Input value={formData.description} onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))} placeholder="Descrição opcional" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Tipo</Label>
                <Select value={formData.type} onValueChange={v => setFormData(prev => ({ ...prev, type: v as 'block' | 'allow' }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="block">Bloqueio</SelectItem><SelectItem value="allow">Permissão</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label>Alvo</Label>
                <Select value={formData.target_type} onValueChange={v => setFormData(prev => ({ ...prev, target_type: v as 'domain' | 'url' | 'category' }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="domain">Domínio</SelectItem><SelectItem value="url">URL</SelectItem><SelectItem value="category">Categoria</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            {formData.target_type === 'category' ? (
              <div><Label>Categoria</Label>
                <Select value={formData.target_value} onValueChange={v => setFormData(prev => ({ ...prev, target_value: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{URL_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            ) : (
              <div><Label>{formData.target_type === 'domain' ? 'Domínio' : 'URL'}</Label><Input value={formData.target_value} onChange={e => setFormData(prev => ({ ...prev, target_value: e.target.value }))} placeholder={formData.target_type === 'domain' ? 'ex: facebook.com' : 'ex: https://...'} /></div>
            )}
            <div><Label>Aplicar a</Label>
              <Select value={formData.applies_to} onValueChange={v => setFormData(prev => ({ ...prev, applies_to: v as 'all' | 'teams' | 'employees' }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="all">Todos</SelectItem><SelectItem value="teams">Equipes</SelectItem><SelectItem value="employees">Funcionários</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between"><Label>Ativa</Label><Switch checked={formData.is_active} onCheckedChange={v => setFormData(prev => ({ ...prev, is_active: v }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={isCreating || isUpdating || !formData.name || !formData.target_value}>
              {isCreating || isUpdating ? 'Salvando...' : editingRule ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Regra?</AlertDialogTitle>
            <AlertDialogDescription>A regra &quot;{deletingRule?.name}&quot; será removida permanentemente.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>{isDeleting ? 'Excluindo...' : 'Excluir'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export { InternetAccessPage };
