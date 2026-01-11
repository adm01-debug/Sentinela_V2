import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, FolderKanban, MoreVertical, Edit, Trash2, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/DropdownMenu';
import { useProjects, useDeleteProject } from '@/hooks/useProjects';

export default function ProjectsPage() {
  const [search, setSearch] = useState('');
  const { data: projects } = useProjects({ search });
  const remove = useDeleteProject();
  const statusColors = { active: 'default', completed: 'secondary', paused: 'outline' };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center"><h1 className="text-2xl font-bold">Projetos</h1><Link to="/projects/new"><Button><Plus className="mr-2 h-4 w-4" />Novo Projeto</Button></Link></div>
      <div className="relative max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar projetos..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} /></div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects?.map(project => (
          <Card key={project.id}>
            <CardHeader className="flex-row items-start justify-between space-y-0">
              <div><CardTitle className="flex items-center gap-2"><FolderKanban className="h-5 w-5" />{project.name}</CardTitle><CardDescription className="flex items-center gap-2 mt-1"><Calendar className="h-3 w-3" />{format(new Date(project.deadline), 'dd/MM/yyyy')}</CardDescription></div>
              <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem asChild><Link to={`/projects/${project.id}`}><Edit className="mr-2 h-4 w-4" />Editar</Link></DropdownMenuItem><DropdownMenuItem className="text-destructive" onClick={() => remove.mutate(project.id)}><Trash2 className="mr-2 h-4 w-4" />Excluir</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
              <div className="space-y-2"><div className="flex justify-between text-sm"><span>Progresso</span><span>{project.progress}%</span></div><Progress value={project.progress} /></div>
              <Badge variant={statusColors[project.status] as any}>{project.status}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}