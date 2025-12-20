import { useTeamsPage } from '@/hooks/useTeamsPage';
import { TeamStatsCards, TeamCard } from '@/components/teams';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Search, Plus, Loader2, Users } from 'lucide-react';

export default function Teams() {
  const {
    searchTerm, setSearchTerm, statusFilter, setStatusFilter,
    isDialogOpen, isDeleteDialogOpen, setIsDeleteDialogOpen,
    isMembersDialogOpen, setIsMembersDialogOpen,
    editingTeam, deletingTeam, setDeletingTeam,
    selectedTeam, teamMembers,
    formData, setFormData,
    teams, employees, stats,
    isLoading, isLoadingMembers,
    isCreating, isUpdating, isDeleting,
    handleOpenCreate, handleOpenEdit, handleCloseDialog,
    handleSubmit, handleDelete, handleViewMembers,
  } = useTeamsPage();

  return (
    <div className="flex-1 space-y-6 p-6">
      <PageHeader title="Equipes" description="Gerencie equipes e seus membros">
        <Button onClick={handleOpenCreate}><Plus className="mr-2 h-4 w-4" />Nova Equipe</Button>
      </PageHeader>

      <TeamStatsCards stats={stats} />

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar equipes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="active">Ativas</SelectItem>
            <SelectItem value="inactive">Inativas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
      ) : teams.length === 0 ? (
        <Card><CardContent className="text-center py-12 text-muted-foreground"><Users className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>Nenhuma equipe encontrada</p></CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} onEdit={handleOpenEdit} onDelete={(t) => { setDeletingTeam(t); setIsDeleteDialogOpen(true); }} onViewMembers={handleViewMembers} />
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTeam ? 'Editar' : 'Nova'} Equipe</DialogTitle>
            <DialogDescription>Configure os dados da equipe</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label>Nome</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
            <div className="grid gap-2"><Label>Descricao</Label><Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></div>
            <div className="grid gap-2">
              <Label>Gerente</Label>
              <Select value={formData.manager_id || ''} onValueChange={(v) => setFormData({ ...formData, manager_id: v || undefined })}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>{employees.map((e) => (<SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between"><Label>Ativa</Label><Switch checked={formData.is_active} onCheckedChange={(v) => setFormData({ ...formData, is_active: v })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={isCreating || isUpdating}>{(isCreating || isUpdating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{editingTeam ? 'Salvar' : 'Criar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isMembersDialogOpen} onOpenChange={setIsMembersDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Membros - {selectedTeam?.name}</DialogTitle>
            <DialogDescription>{teamMembers.length} membros na equipe</DialogDescription>
          </DialogHeader>
          {isLoadingMembers ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : teamMembers.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">Nenhum membro</p>
          ) : (
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium">{member.employee.name}</p>
                      <p className="text-sm text-muted-foreground">{member.employee.email}</p>
                    </div>
                    <Badge variant="outline">{member.role}</Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} title="Excluir Equipe" description={`Excluir "${deletingTeam?.name}"?`} onConfirm={handleDelete} isLoading={isDeleting} variant="destructive" />
    </div>
  );
}
