import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Users, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/Avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/DropdownMenu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import { useTeams, useCreateTeam, useDeleteTeam } from '@/hooks/useTeams';

export default function TeamsPage() {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const { data: teams } = useTeams({ search });
  const createTeam = useCreateTeam();
  const deleteTeam = useDeleteTeam();

  const handleCreate = async () => { await createTeam.mutateAsync({ name }); setOpen(false); setName(''); };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center"><h1 className="text-2xl font-bold">Equipes</h1><Button onClick={() => setOpen(true)}><Plus className="mr-2 h-4 w-4" />Nova Equipe</Button></div>
      <div className="relative max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar equipes..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} /></div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teams?.map(team => (
          <Card key={team.id}>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />{team.name}</CardTitle><CardDescription>{team.memberCount} membros</CardDescription></div>
              <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem asChild><Link to={`/teams/${team.id}`}><Edit className="mr-2 h-4 w-4" />Editar</Link></DropdownMenuItem><DropdownMenuItem className="text-destructive" onClick={() => deleteTeam.mutate(team.id)}><Trash2 className="mr-2 h-4 w-4" />Excluir</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
            </CardHeader>
            <CardContent>
              <div className="flex -space-x-2">{team.members?.slice(0, 5).map((m, i) => <Avatar key={i} className="h-8 w-8 border-2 border-background"><AvatarImage src={m.avatar} /><AvatarFallback>{m.name?.charAt(0)}</AvatarFallback></Avatar>)}{team.memberCount > 5 && <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs">+{team.memberCount - 5}</div>}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>Nova Equipe</DialogTitle></DialogHeader><Input label="Nome da equipe" value={name} onChange={e => setName(e.target.value)} /><DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button onClick={handleCreate} loading={createTeam.isPending}>Criar</Button></DialogFooter></DialogContent></Dialog>
    </div>
  );
}