import { PageTransition } from '@/components/PageTransition';
import { PageHeader } from '@/components/layout/PageHeader';
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Users, MoreVertical, Edit, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
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
import { useTeams, useCreateTeam, useDeleteTeam } from '@/hooks/useTeams';
import { useChartColors } from '@/hooks/useChartColors';
import { useTranslation } from 'react-i18next';
import { BaseBarChart } from '@/components/charts';
import { NoDataEmptyState, NoResultsEmptyState } from '@/components/EmptyStates';
import { generateRoute } from '@/constants/routes';

export default function TeamsPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const { data: teams, isLoading, isError, error, refetch } = useTeams();
  const createTeam = useCreateTeam();
  const deleteTeam = useDeleteTeam();
  const colors = useChartColors();

  const filtered = useMemo(() =>
    (teams || []).filter(team =>
      !search || team.name.toLowerCase().includes(search.toLowerCase())
    ), [teams, search]
  );

  const handleCreate = async () => {
    const name = teamName.trim();
    if (!name) return;
    // Prevent duplicates client-side (server unique constraint should back this)
    if ((teams || []).some(team => team.name.toLowerCase() === name.toLowerCase())) {
      return;
    }
    try {
      await createTeam.mutateAsync({ name });
      setIsDialogOpen(false);
      setTeamName('');
    } catch {
      // Error toast handled by mutation
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await deleteTeam.mutateAsync(confirmDeleteId);
    } catch {
      // Error toast handled by mutation
    } finally {
      setConfirmDeleteId(null);
    }
  };

  // Team size chart — uses full dataset (not filtered) for stable global metric
  const sizeData = useMemo(() =>
    (teams || [])
      .map(team => ({ name: team.name, membros: team.member_count || 0 }))
      .sort((a, b) => b.membros - a.membros)
      .slice(0, 10),
    [teams]
  );

  const duplicateName = useMemo(() => {
    const name = teamName.trim().toLowerCase();
    if (!name) return false;
    return (teams || []).some(team => team.name.toLowerCase() === name);
  }, [teamName, teams]);

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader 
          title={t('nav.teams')}
          description="Gerencie as equipes e seus membros"
          actions={
            <Button onClick={() => setIsDialogOpen(true)} className="gap-2 h-9">
              <Plus className="h-4 w-4" />
              {t('common.add')}
            </Button>
          }
        />

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('common.search')}
            className="pl-9 h-10"
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label={t('common.search')}
          />
        </div>

        {isError && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardHeader className="flex-row items-center gap-3 space-y-0">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <div className="flex-1">
                <CardTitle className="text-sm">Erro ao carregar equipes</CardTitle>
                <CardDescription>{(error as Error)?.message || 'Tente novamente.'}</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Tentar novamente
              </Button>
            </CardHeader>
          </Card>
        )}

        {/* Charts Section */}
        {sizeData.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Distribuição de Membros por Equipe</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[220px]">
                <BaseBarChart
                  data={sizeData}
                  xAxisKey="name"
                  height={220}
                  series={[{ dataKey: 'membros', label: 'Membros', color: colors.primary }]}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <Card key={i} className="h-32 animate-pulse bg-muted/50" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map(team => (
              <Card key={team.id} className="hover:border-primary/50 transition-colors">
                <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                  <div className="min-w-0">
                    <CardTitle className="flex items-center gap-2 truncate">
                      <Users className="h-4 w-4 text-primary shrink-0" />
                      <span className="truncate">{team.name}</span>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      {team.member_count || 0} membros
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to={generateRoute.team(team.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          {t('common.edit')}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setConfirmDeleteId(team.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {t('common.delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="sm" className="w-full text-xs" asChild>
                    <Link to={generateRoute.team(team.id)}>
                      Ver Detalhes
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : search ? (
          <NoResultsEmptyState searchTerm={search} onClearSearch={() => setSearch('')} />
        ) : (
          <NoDataEmptyState 
            title="Nenhuma equipe encontrada" 
            description="Crie sua primeira equipe para começar a organizar seus funcionários."
            primaryAction={{
              label: 'Nova Equipe',
              onClick: () => setIsDialogOpen(true),
              icon: Plus
            }}
          />
        )}

        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setTeamName(''); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Equipe</DialogTitle>
              <DialogDescription>Dê um nome único para identificar a equipe.</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-2">
              <Input
                value={teamName}
                onChange={e => setTeamName(e.target.value)}
                placeholder="Ex: Desenvolvimento, Vendas, RH"
                autoFocus
                maxLength={80}
                aria-invalid={duplicateName}
                onKeyDown={e => { if (e.key === 'Enter' && !duplicateName) handleCreate(); }}
              />
              {duplicateName && (
                <p className="text-xs text-destructive">Já existe uma equipe com esse nome.</p>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!teamName.trim() || duplicateName || createTeam.isPending}
              >
                {createTeam.isPending ? t('common.saving') : t('common.create')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={confirmDeleteId !== null} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir equipe?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Os membros perderão o vínculo com esta equipe.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleteTeam.isPending}>{t('common.cancel')}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                disabled={deleteTeam.isPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteTeam.isPending ? t('common.saving') : t('common.delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PageTransition>
  );
}