import { PageTransition } from '@/components/PageTransition';
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Users, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useTeams, useCreateTeam, useDeleteTeam } from '@/hooks/useTeams';
import { useChartColors } from '@/hooks/useChartColors';
import {
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

export default function TeamsPage() {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const { data: teams } = useTeams();
  const createTeam = useCreateTeam();
  const deleteTeam = useDeleteTeam();
  const colors = useChartColors();

  const filtered = (teams || []).filter(t => !search || t.name.toLowerCase().includes(search.toLowerCase()));

  const handleCreate = async () => { await createTeam.mutateAsync({ name }); setOpen(false); setName(''); };

  // Team size chart
  const sizeData = useMemo(() =>
    filtered.map(t => ({ name: t.name, membros: t.member_count || 0 })).sort((a, b) => b.membros - a.membros).slice(0, 10),
    [filtered]
  );

  return (<PageTransition>
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Equipes</h1>
        <Button onClick={() => setOpen(true)}><Plus className="mr-2 h-4 w-4" />Nova Equipe</Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar equipes..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Team Size Chart */}
      {sizeData.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Tamanho das Equipes</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sizeData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                  <XAxis dataKey="name" tick={{ fill: colors.muted, fontSize: 11 }} stroke={colors.border} />
                  <YAxis tick={{ fill: colors.muted, fontSize: 11 }} stroke={colors.border} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Bar dataKey="membros" name="Membros" fill={colors.primary} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map(team => (
          <Card key={team.id}>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />{team.name}</CardTitle>
                <CardDescription>{team.member_count || 0} membros</CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild><Link to={`/teams/${team.id}`}><Edit className="mr-2 h-4 w-4" />Editar</Link></DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive" onClick={() => deleteTeam.mutate(team.id)}><Trash2 className="mr-2 h-4 w-4" />Excluir</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nova Equipe</DialogTitle></DialogHeader>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Nome da equipe" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate}>Criar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
