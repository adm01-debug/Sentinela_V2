import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Building, Calendar, Shield, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Skeleton } from '@/components/Skeleton';
import { useUser, useUserActivity } from '@/hooks/useUsers';

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: user, isLoading } = useUser(id!);
  const { data: activity } = useUserActivity(id!);

  if (isLoading) return <div className="p-6"><Skeleton className="h-96" /></div>;
  if (!user) return <div className="p-6">Usuário não encontrado</div>;

  return (
    <div className="p-6 space-y-6">
      <Button variant="ghost" onClick={() => navigate(-1)}><ArrowLeft className="mr-2 h-4 w-4" />Voltar</Button>
      <div className="flex items-start gap-6">
        <Avatar className="h-24 w-24"><AvatarImage src={user.avatar} /><AvatarFallback className="text-2xl">{user.name?.charAt(0)}</AvatarFallback></Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-4"><h1 className="text-2xl font-bold">{user.name}</h1><Badge>{user.role}</Badge></div>
          <div className="flex items-center gap-6 mt-4 text-muted-foreground">
            <span className="flex items-center gap-2"><Mail className="h-4 w-4" />{user.email}</span>
            {user.phone && <span className="flex items-center gap-2"><Phone className="h-4 w-4" />{user.phone}</span>}
            {user.department && <span className="flex items-center gap-2"><Building className="h-4 w-4" />{user.department}</span>}
          </div>
        </div>
        <Link to={`/users/${id}/edit`}><Button>Editar</Button></Link>
      </div>
      <Tabs defaultValue="activity">
        <TabsList><TabsTrigger value="activity">Atividade</TabsTrigger><TabsTrigger value="permissions">Permissões</TabsTrigger></TabsList>
        <TabsContent value="activity" className="mt-4">
          <Card><CardContent className="pt-6">{activity?.map((a, i) => <div key={i} className="flex items-center gap-4 py-2 border-b last:border-0"><Activity className="h-4 w-4" /><span>{a.description}</span><span className="text-sm text-muted-foreground ml-auto">{format(new Date(a.timestamp), 'dd/MM HH:mm')}</span></div>)}</CardContent></Card>
        </TabsContent>
        <TabsContent value="permissions" className="mt-4">
          <Card><CardHeader><CardTitle>Permissões</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Função: {user.role}</p></CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}