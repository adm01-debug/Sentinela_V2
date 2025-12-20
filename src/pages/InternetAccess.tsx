import { useInternetAccessPage } from '@/hooks/useInternetAccessPage';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Search, Plus, Edit, Trash2, Loader2, Globe, Shield, ShieldOff, Ban } from 'lucide-react';

export default function InternetAccess() {
  const {
    searchTerm, setSearchTerm, typeFilter, setTypeFilter,
    isDialogOpen, isDeleteDialogOpen, setIsDeleteDialogOpen,
    editingRule, deletingRule, setDeletingRule,
    formData, setFormData,
    rules, stats, isLoading,
    isCreating, isUpdating, isDeleting,
    handleOpenCreate, handleOpenEdit, handleCloseDialog,
    handleSubmit, handleDelete, URL_CATEGORIES,
  } = useInternetAccessPage();

  return (
    <div className="flex-1 space-y-6 p-6">
      <PageHeader title="Controle de Acesso Internet" description="Gerencie regras de acesso a sites e dominios">
        <Button onClick={handleOpenCreate}><Plus className="mr-2 h-4 w-4" />Nova Regra</Button>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bloqueios</CardTitle>
            <ShieldOff className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-red-600">{stats.blocked}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Permitidos</CardTitle>
            <Shield className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{stats.allowed}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acessos Bloq.</CardTitle>
            <Ban className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.totalBlocks}</div></CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar regras..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="block">Bloqueio</SelectItem>
            <SelectItem value="allow">Permitido</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : rules.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma regra encontrada</p>
            </div>
          ) : (
            <div className="divide-y">
              {rules.map((rule) => (
                <div key={rule.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${rule.type === 'block' ? 'bg-red-100' : 'bg-green-100'}`}>
                      {rule.type === 'block' ? <ShieldOff className="h-4 w-4 text-red-600" /> : <Shield className="h-4 w-4 text-green-600" />}
                    </div>
                    <div>
                      <p className="font-medium">{rule.name}</p>
                      <p className="text-sm text-muted-foreground">{rule.target_value}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={rule.type === 'block' ? 'destructive' : 'default'}>{rule.type === 'block' ? 'Bloqueio' : 'Permitido'}</Badge>
                    <Badge variant="outline">{rule.blocked_count} bloq.</Badge>
                    <Switch checked={rule.is_active} />
                    <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(rule)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => { setDeletingRule(rule); setIsDeleteDialogOpen(true); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRule ? 'Editar' : 'Nova'} Regra</DialogTitle>
            <DialogDescription>Configure o controle de acesso</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Nome</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Descricao</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Tipo</Label>
                <Select value={formData.type} onValueChange={(v: 'block' | 'allow') => setFormData({ ...formData, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="block">Bloquear</SelectItem>
                    <SelectItem value="allow">Permitir</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Alvo</Label>
                <Select value={formData.target_type} onValueChange={(v: any) => setFormData({ ...formData, target_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="domain">Dominio</SelectItem>
                    <SelectItem value="url">URL</SelectItem>
                    <SelectItem value="category">Categoria</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Valor</Label>
              {formData.target_type === 'category' ? (
                <Select value={formData.target_value} onValueChange={(v) => setFormData({ ...formData, target_value: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione categoria" /></SelectTrigger>
                  <SelectContent>{URL_CATEGORIES.map((c) => (<SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>))}</SelectContent>
                </Select>
              ) : (
                <Input value={formData.target_value} onChange={(e) => setFormData({ ...formData, target_value: e.target.value })} placeholder={formData.target_type === 'domain' ? 'exemplo.com' : 'https://...'} />
              )}
            </div>
            <div className="flex items-center justify-between"><Label>Ativa</Label><Switch checked={formData.is_active} onCheckedChange={(v) => setFormData({ ...formData, is_active: v })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={isCreating || isUpdating}>
              {(isCreating || isUpdating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingRule ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} title="Excluir Regra" description={`Excluir "${deletingRule?.name}"?`} onConfirm={handleDelete} isLoading={isDeleting} variant="destructive" />
    </div>
  );
}
