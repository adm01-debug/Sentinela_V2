import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useTeam } from '@/hooks/useTeams';

export default function TeamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: team, isLoading } = useTeam(id!);

  if (isLoading) return <div className="p-6"><Skeleton className="h-96" /></div>;
  if (!team) return <div className="p-6">Equipe não encontrada</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)}><ArrowLeft className="mr-2 h-4 w-4" />Voltar</Button>
          <Users className="h-6 w-6" />
          <h1 className="text-2xl font-bold">{team.name}</h1>
          <Badge>{team.member_count || 0} membros</Badge>
        </div>
        <Button><Plus className="mr-2 h-4 w-4" />Adicionar Membro</Button>
      </div>
      <Card>
        <CardHeader><CardTitle>Membros</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Lista de membros será carregada aqui.</p>
        </CardContent>
      </Card>
    </div>
  );
}
