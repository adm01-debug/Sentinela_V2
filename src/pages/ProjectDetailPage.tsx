import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FolderKanban, Calendar, Users, Clock, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { Button  } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent  } from '@/components/ui/card';
import { Badge  } from '@/components/ui/badge';
import { Progress  } from '@/components/ui/progress';
import { Avatar, AvatarImage, AvatarFallback  } from '@/components/ui/avatar';
import { Skeleton } from '@/components/Skeleton';
import { useProject } from '@/hooks/useProjects';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: project, isLoading } = useProject(id!);

  if (isLoading) return <div className="p-6"><Skeleton className="h-96" /></div>;
  if (!project) return <div className="p-6">Projeto não encontrado</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4"><Button variant="ghost" onClick={() => navigate(-1)}><ArrowLeft className="mr-2 h-4 w-4" />Voltar</Button><FolderKanban className="h-6 w-6" /><h1 className="text-2xl font-bold">{project.name}</h1><Badge>{project.status}</Badge></div>
        <Button>Editar</Button>
      </div>
      <div className="grid gap-6 md:grid-cols-4">
        <Card><CardContent className="pt-6"><Calendar className="h-5 w-5 text-muted-foreground" /><p className="text-sm text-muted-foreground mt-2">Prazo</p><p className="font-medium">{format(new Date(project.deadline), 'dd/MM/yyyy')}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><Users className="h-5 w-5 text-muted-foreground" /><p className="text-sm text-muted-foreground mt-2">Equipe</p><p className="font-medium">{project.teamCount} pessoas</p></CardContent></Card>
        <Card><CardContent className="pt-6"><Clock className="h-5 w-5 text-muted-foreground" /><p className="text-sm text-muted-foreground mt-2">Horas</p><p className="font-medium">{project.totalHours}h</p></CardContent></Card>
        <Card><CardContent className="pt-6"><TrendingUp className="h-5 w-5 text-muted-foreground" /><p className="text-sm text-muted-foreground mt-2">Progresso</p><Progress value={project.progress} className="mt-2" /></CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle>Descrição</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">{project.description}</p></CardContent></Card>
      <Card><CardHeader><CardTitle>Equipe</CardTitle></CardHeader><CardContent className="flex flex-wrap gap-4">{project.team?.map(m => <div key={m.id} className="flex items-center gap-2"><Avatar className="h-8 w-8"><AvatarImage src={m.avatar} /><AvatarFallback>{m.name?.charAt(0)}</AvatarFallback></Avatar><span className="text-sm">{m.name}</span></div>)}</CardContent></Card>
    </div>
  );
}