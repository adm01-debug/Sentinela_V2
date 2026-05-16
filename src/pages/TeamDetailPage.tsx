import { useParams, useNavigate } from 'react-router-dom';
import { Users, Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
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
    <div className="space-y-6">
      <PageHeader 
        title={team.name} 
        showBackButton={true}
        actions={
          <div className="flex items-center gap-2">
            <Badge className="mr-2">{team.member_count || 0} membros</Badge>
            <Button className="h-9 gap-2"><Plus className="h-4 w-4" />Adicionar Membro</Button>
          </div>
        }
      />

      <Card>
        <CardHeader><CardTitle>Membros</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Lista de membros será carregada aqui.</p>
        </CardContent>
      </Card>
    </div>
  );
}
