import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Users, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PageTransition } from '@/components/PageTransition';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useTeams, useCreateTeam, useDeleteTeam } from '@/hooks/useTeams';
import { useChartColors } from '@/hooks/useChartColors';
import { BaseBarChart } from '@/components/charts';
import { NoDataEmptyState, NoResultsEmptyState } from '@/components/EmptyStates';
import { generateRoute } from '@/constants/routes';

export default function TeamsPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [teamName, setTeamName] = useState('');
  
  const { data: teams, isLoading } = useTeams();
  const createTeam = useCreateTeam();
  const deleteTeam = useDeleteTeam();
  const colors = useChartColors();

  const filtered = useMemo(() => 
    (teams || []).filter(t => 
      !search || t.name.toLowerCase().includes(search.toLowerCase())
    ), [teams, search]
  );

  const handleCreate = async () => {
    if (!teamName.trim()) return;
    try {
      await createTeam.mutateAsync({ name: teamName.trim() });
      setIsDialogOpen(false);
      setTeamName('');
    } catch (err) {
      // Error handled by mutation toast
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTeam.mutateAsync(id);
    } catch (err) {
      // Error handled by mutation toast
    }
  };

  // Team size chart
  const sizeData = useMemo(() =>
    filtered
      .map(t => ({ name: t.name, membros: t.member_count || 0 }))
      .sort((a, b) => b.membros - a.membros)
      .slice(0, 10),
    [filtered]
  );

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
          />
        </div>

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
                        onClick={() => handleDelete(team.id)}
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

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Equipe</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Input 
                value={teamName} 
                onChange={e => setTeamName(e.target.value)} 
                placeholder="Ex: Desenvolvimento, Vendas, RH"
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleCreate} disabled={!teamName.trim() || createTeam.isPending}>
                {createTeam.isPending ? t('common.saving') : t('common.create')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}