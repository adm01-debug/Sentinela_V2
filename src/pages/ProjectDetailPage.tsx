import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FolderKanban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/Skeleton';
import { useProjects } from '@/hooks/useProjects';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects } = useProjects();
  const project = projects.find(p => p.id === id);

  if (!project) return <div className="p-6">Projeto não encontrado</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />Voltar
        </Button>
        <FolderKanban className="h-6 w-6" />
        <h1 className="text-2xl font-bold">{project.name}</h1>
        <Badge>{project.status}</Badge>
      </div>
      <Card>
        <CardHeader><CardTitle>Detalhes</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Status: {project.status}</p>
        </CardContent>
      </Card>
    </div>
  );
}
