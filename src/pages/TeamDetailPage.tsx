import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Users, Plus, Search, UserMinus, Mail, Building2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageTransition } from '@/components/PageTransition';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { NoDataEmptyState, NoResultsEmptyState } from '@/components/EmptyStates';
import {
  useTeam,
  useTeamMembers,
  useAvailableEmployees,
  useAddTeamMember,
  useRemoveTeamMember,
  type TeamMemberEmployee,
} from '@/hooks/useTeams';

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

export default function TeamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const teamId = id;

  const { data: team, isLoading: teamLoading, isError, error } = useTeam(teamId);
  const { data: members = [], isLoading: membersLoading } = useTeamMembers(teamId);
  const { data: available = [] } = useAvailableEmployees(teamId);
  const addMember = useAddTeamMember();
  const removeMember = useRemoveTeamMember();

  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [addSearch, setAddSearch] = useState('');
  const [toRemove, setToRemove] = useState<TeamMemberEmployee | null>(null);

  const filteredMembers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        (m.email ?? '').toLowerCase().includes(q) ||
        (m.department ?? '').toLowerCase().includes(q),
    );
  }, [members, search]);

  const filteredAvailable = useMemo(() => {
    const q = addSearch.trim().toLowerCase();
    if (!q) return available;
    return available.filter(
      (m) => m.name.toLowerCase().includes(q) || (m.email ?? '').toLowerCase().includes(q),
    );
  }, [available, addSearch]);

  if (teamLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-sm">Erro ao carregar equipe</CardTitle>
          <CardDescription>{(error as Error)?.message || 'Tente novamente.'}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!team) {
    return (
      <NoDataEmptyState
        title="Equipe não encontrada"
        description="A equipe pode ter sido excluída ou você não tem permissão para visualizá-la."
      />
    );
  }

  const handleAdd = async (employeeId: string) => {
    if (!teamId) return;
    try {
      await addMember.mutateAsync({ teamId, employeeId });
    } catch {
      /* toast handled by mutation */
    }
  };

  const handleConfirmRemove = async () => {
    if (!toRemove) return;
    try {
      await removeMember.mutateAsync(toRemove.id);
    } catch {
      /* toast handled by mutation */
    } finally {
      setToRemove(null);
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title={team.name}
          description={team.description || 'Detalhes e membros da equipe'}
          showBackButton
          actions={
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <Users className="h-3 w-3" />
                {members.length} {members.length === 1 ? 'membro' : 'membros'}
              </Badge>
              <Button className="h-9 gap-2" onClick={() => setAddOpen(true)}>
                <Plus className="h-4 w-4" />
                Adicionar membro
              </Button>
            </div>
          }
        />

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-4">
              <CardTitle className="text-base">Membros</CardTitle>
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9 h-9"
                  placeholder="Buscar por nome, e-mail ou departamento"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Buscar membros"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {membersLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : filteredMembers.length === 0 && search ? (
              <NoResultsEmptyState searchTerm={search} onClearSearch={() => setSearch('')} />
            ) : filteredMembers.length === 0 ? (
              <NoDataEmptyState
                title="Nenhum membro nesta equipe"
                description="Adicione funcionários ativos para começar a organizar o time."
                primaryAction={{ label: 'Adicionar membro', onClick: () => setAddOpen(true), icon: Plus }}
              />
            ) : (
              <ul className="divide-y divide-border" role="list">
                {filteredMembers.map((m) => (
                  <li key={m.id} className="flex items-center gap-3 py-3">
                    <Avatar className="h-9 w-9">
                      {m.avatar_url && <AvatarImage src={m.avatar_url} alt={m.name} />}
                      <AvatarFallback>{initials(m.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{m.name}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {m.email && (
                          <span className="flex items-center gap-1 truncate">
                            <Mail className="h-3 w-3 shrink-0" />
                            <span className="truncate">{m.email}</span>
                          </span>
                        )}
                        {m.department && (
                          <span className="flex items-center gap-1 truncate">
                            <Building2 className="h-3 w-3 shrink-0" />
                            <span className="truncate">{m.department}</span>
                          </span>
                        )}
                      </div>
                    </div>
                    {m.position && (
                      <Badge variant="outline" className="hidden sm:inline-flex">
                        {m.position}
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setToRemove(m)}
                      aria-label={`Remover ${m.name} da equipe`}
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Dialog open={addOpen} onOpenChange={(open) => { setAddOpen(open); if (!open) setAddSearch(''); }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Adicionar membro</DialogTitle>
              <DialogDescription>
                Selecione funcionários ativos sem equipe para incluir em <strong>{team.name}</strong>.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Buscar funcionário disponível"
                  value={addSearch}
                  onChange={(e) => setAddSearch(e.target.value)}
                  autoFocus
                  aria-label="Buscar funcionário disponível"
                />
              </div>
              <div className="max-h-72 overflow-y-auto rounded-md border">
                {filteredAvailable.length === 0 ? (
                  <p className="p-6 text-center text-sm text-muted-foreground">
                    Nenhum funcionário disponível.
                  </p>
                ) : (
                  <ul className="divide-y divide-border" role="list">
                    {filteredAvailable.map((emp) => (
                      <li key={emp.id} className="flex items-center gap-3 p-3">
                        <Avatar className="h-8 w-8">
                          {emp.avatar_url && <AvatarImage src={emp.avatar_url} alt={emp.name} />}
                          <AvatarFallback>{initials(emp.name)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{emp.name}</p>
                          {emp.email && (
                            <p className="text-xs text-muted-foreground truncate">{emp.email}</p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={addMember.isPending}
                          onClick={() => handleAdd(emp.id)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Adicionar
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddOpen(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={toRemove !== null} onOpenChange={(open) => !open && setToRemove(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remover da equipe?</AlertDialogTitle>
              <AlertDialogDescription>
                {toRemove
                  ? `${toRemove.name} deixará de pertencer a esta equipe. O funcionário não será excluído.`
                  : ''}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={removeMember.isPending}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmRemove}
                disabled={removeMember.isPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {removeMember.isPending ? 'Removendo...' : 'Remover'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PageTransition>
  );
}
