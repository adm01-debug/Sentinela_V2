import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  Users, 
  Plus, 
  Search, 
  Loader2, 
  UserPlus, 
  Trash2, 
  Edit, 
  Crown,
  Building2,
  ChevronRight,
  UserMinus
} from 'lucide-react';
import { useTeams, type TeamWithMembers } from '@/hooks/useTeams';
import { cn } from '@/lib/utils';

export default function Teams() {
  const { teams, loading, createTeam, updateTeam, deleteTeam, addMember, removeMember, updateMemberRole } = useTeams();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<TeamWithMembers | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    leader_name: '',
    parent_team_id: ''
  });
  const [newMember, setNewMember] = useState({ name: '', role: 'member' });

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.leader_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const rootTeams = filteredTeams.filter(t => !t.parent_team_id);

  const handleCreateTeam = async () => {
    if (!formData.name.trim()) return;
    
    await createTeam({
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      leader_name: formData.leader_name.trim() || null,
      leader_id: null,
      parent_team_id: formData.parent_team_id || null
    });
    
    setFormData({ name: '', description: '', leader_name: '', parent_team_id: '' });
    setIsCreateOpen(false);
  };

  const handleUpdateTeam = async () => {
    if (!selectedTeam || !formData.name.trim()) return;
    
    await updateTeam(selectedTeam.id, {
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      leader_name: formData.leader_name.trim() || null,
      parent_team_id: formData.parent_team_id || null
    });
    
    setFormData({ name: '', description: '', leader_name: '', parent_team_id: '' });
    setSelectedTeam(null);
    setIsEditOpen(false);
  };

  const handleAddMember = async () => {
    if (!selectedTeam || !newMember.name.trim()) return;
    
    await addMember(selectedTeam.id, newMember.name.trim(), newMember.role);
    setNewMember({ name: '', role: 'member' });
    setIsAddMemberOpen(false);
  };

  const openEditDialog = (team: TeamWithMembers) => {
    setSelectedTeam(team);
    setFormData({
      name: team.name,
      description: team.description || '',
      leader_name: team.leader_name || '',
      parent_team_id: team.parent_team_id || ''
    });
    setIsEditOpen(true);
  };

  const openAddMemberDialog = (team: TeamWithMembers) => {
    setSelectedTeam(team);
    setNewMember({ name: '', role: 'member' });
    setIsAddMemberOpen(true);
  };

  const renderTeamCard = (team: TeamWithMembers, level: number = 0) => {
    const childTeams = teams.filter(t => t.parent_team_id === team.id);
    
    return (
      <div key={team.id} className={cn("space-y-3", level > 0 && "ml-6 border-l-2 border-border pl-4")}>
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {team.name}
                    {level > 0 && (
                      <Badge variant="outline" className="text-xs">
                        Sub-equipe
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {team.description || 'Sem descrição'}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => openEditDialog(team)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir equipe?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação não pode ser desfeita. Todos os membros serão desvinculados.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteTeam(team.id)} className="bg-destructive text-destructive-foreground">
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Leader */}
            {team.leader_name && (
              <div className="flex items-center gap-2 text-sm">
                <Crown className="h-4 w-4 text-warning" />
                <span className="text-muted-foreground">Líder:</span>
                <span className="font-medium">{team.leader_name}</span>
              </div>
            )}

            {/* Members */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {team.members.length} membro(s)
                </span>
                <Button variant="outline" size="sm" onClick={() => openAddMemberDialog(team)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </div>
              
              {team.members.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {team.members.map(member => (
                    <div
                      key={member.id}
                      className="flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-sm"
                    >
                      <span>{member.employee_name}</span>
                      {member.role && member.role !== 'member' && (
                        <Badge variant="secondary" className="text-xs">
                          {member.role}
                        </Badge>
                      )}
                      <button
                        onClick={() => removeMember(member.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <UserMinus className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 pt-2 border-t border-border text-xs text-muted-foreground">
              <span>Criada em {new Date(team.created_at).toLocaleDateString('pt-BR')}</span>
              {childTeams.length > 0 && (
                <span className="flex items-center gap-1">
                  <ChevronRight className="h-3 w-3" />
                  {childTeams.length} sub-equipe(s)
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Child teams */}
        {childTeams.map(child => renderTeamCard(child, level + 1))}
      </div>
    );
  };

  if (loading) {
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Gestão de Equipes</h1>
              <p className="text-muted-foreground">
                Gerencie equipes, líderes e colaboradores
              </p>
            </div>
            
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Equipe
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Nova Equipe</DialogTitle>
                  <DialogDescription>
                    Preencha os dados da nova equipe
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome da Equipe *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Desenvolvimento"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Descrição da equipe..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="leader">Líder da Equipe</Label>
                    <Input
                      id="leader"
                      value={formData.leader_name}
                      onChange={(e) => setFormData({ ...formData, leader_name: e.target.value })}
                      placeholder="Nome do líder"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parent">Equipe Superior (opcional)</Label>
                    <Select
                      value={formData.parent_team_id}
                      onValueChange={(value) => setFormData({ ...formData, parent_team_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma equipe superior" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Nenhuma (equipe raiz)</SelectItem>
                        {teams.map(team => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateTeam} disabled={!formData.name.trim()}>
                    Criar Equipe
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar equipes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{teams.length}</p>
                    <p className="text-sm text-muted-foreground">Total de Equipes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10">
                    <Crown className="h-6 w-6 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{teams.filter(t => t.leader_name).length}</p>
                    <p className="text-sm text-muted-foreground">Com Líderes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                    <Users className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {teams.reduce((acc, t) => acc + t.members.length, 0)}
                    </p>
                    <p className="text-sm text-muted-foreground">Total de Membros</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Teams List */}
          <div className="space-y-4">
            {rootTeams.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">
                    Nenhuma equipe encontrada. Crie a primeira equipe!
                  </p>
                </CardContent>
              </Card>
            ) : (
              rootTeams.map(team => renderTeamCard(team))
            )}
          </div>
        </main>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Equipe</DialogTitle>
            <DialogDescription>
              Atualize os dados da equipe
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome da Equipe *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-leader">Líder da Equipe</Label>
              <Input
                id="edit-leader"
                value={formData.leader_name}
                onChange={(e) => setFormData({ ...formData, leader_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-parent">Equipe Superior</Label>
              <Select
                value={formData.parent_team_id}
                onValueChange={(value) => setFormData({ ...formData, parent_team_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma equipe superior" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhuma (equipe raiz)</SelectItem>
                  {teams
                    .filter(t => t.id !== selectedTeam?.id)
                    .map(team => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateTeam} disabled={!formData.name.trim()}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Membro</DialogTitle>
            <DialogDescription>
              Adicione um colaborador à equipe {selectedTeam?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="member-name">Nome do Colaborador *</Label>
              <Input
                id="member-name"
                value={newMember.name}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                placeholder="Nome completo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="member-role">Função na Equipe</Label>
              <Select
                value={newMember.role}
                onValueChange={(value) => setNewMember({ ...newMember, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Membro</SelectItem>
                  <SelectItem value="coordinator">Coordenador</SelectItem>
                  <SelectItem value="supervisor">Supervisor</SelectItem>
                  <SelectItem value="analyst">Analista</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddMemberOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddMember} disabled={!newMember.name.trim()}>
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
