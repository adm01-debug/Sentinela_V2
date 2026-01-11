import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Plus, Trash2, UserMinus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/Skeleton';
import { useTeam, useRemoveTeamMember } from '@/hooks/useTeams';

export default function TeamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: team, isLoading } = useTeam(id!);
  const removeMember = useRemoveTeamMember();

  if (isLoading) return <div className="p-6"><Skeleton className="h-96" /></div>;
  if (!team) return <div className="p-6">Equipe não encontrada</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4"><Button variant="ghost" onClick={() => navigate(-1)}><ArrowLeft className="mr-2 h-4 w-4" />Voltar</Button><Users className="h-6 w-6" /><h1 className="text-2xl font-bold">{team.name}</h1><Badge>{team.memberCount} membros</Badge></div>
        <Button><Plus className="mr-2 h-4 w-4" />Adicionar Membro</Button>
      </div>
      <Card>
        <CardHeader><CardTitle>Membros</CardTitle></CardHeader>
        <CardContent className="p-0 divide-y">
          {team.members?.map(member => (
            <div key={member.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4"><Avatar><AvatarImage src={member.avatar} /><AvatarFallback>{member.name?.charAt(0)}</AvatarFallback></Avatar><div><p className="font-medium">{member.name}</p><p className="text-sm text-muted-foreground">{member.email}</p></div></div>
              <div className="flex items-center gap-4"><Badge variant="secondary">{member.role}</Badge><Button variant="ghost" size="icon" onClick={() => removeMember.mutate({ teamId: id!, memberId: member.id })}><UserMinus className="h-4 w-4 text-destructive" /></Button></div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}