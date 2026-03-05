import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, FolderKanban, MoreVertical, Edit, Trash2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useProjects } from '@/hooks/useProjects';

export default function ProjectsPage() {
  const [search, setSearch] = useState('');
  const { projects, remove } = useProjects();

  const filtered = projects.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Projetos</h1>
        <Link to="/projects/new"><Button><Plus className="mr-2 h-4 w-4" />Novo Projeto</Button></Link>
      </div>
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar projetos..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map(project => (
          <Card key={project.id}>
            <CardHeader className="flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FolderKanban className="h-5 w-5" />{project.name}
                </CardTitle>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="text-destructive" onClick={() => remove(project.id)}>
                    <Trash2 className="mr-2 h-4 w-4" />Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              <Badge>{project.status}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
