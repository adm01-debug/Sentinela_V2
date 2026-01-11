import { Link } from 'react-router-dom';
import { User, Mail, Phone, Building, Calendar, Edit, Shield, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { useAuthStore } from '@/stores/authStore';
import { useUserStats } from '@/hooks/useAuth';

export default function ProfilePage() {
  const user = useAuthStore(s => s.user);
  const { data: stats } = useUserStats();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-6">
          <Avatar className="h-24 w-24"><AvatarImage src={user?.avatar} /><AvatarFallback className="text-2xl">{user?.name?.charAt(0)}</AvatarFallback></Avatar>
          <div><h1 className="text-2xl font-bold">{user?.name}</h1><p className="text-muted-foreground">{user?.role}</p><div className="flex items-center gap-4 mt-2"><span className="flex items-center gap-1 text-sm"><Mail className="h-4 w-4" />{user?.email}</span>{user?.phone && <span className="flex items-center gap-1 text-sm"><Phone className="h-4 w-4" />{user?.phone}</span>}</div></div>
        </div>
        <Link to="/profile/edit"><Button><Edit className="mr-2 h-4 w-4" />Editar Perfil</Button></Link>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold">{stats?.productivity}%</p><p className="text-muted-foreground">Produtividade</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold">{stats?.activeHours}h</p><p className="text-muted-foreground">Horas ativas</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold">{stats?.tasksCompleted}</p><p className="text-muted-foreground">Tarefas</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold">{stats?.streak}</p><p className="text-muted-foreground">Dias consecutivos</p></CardContent></Card>
      </div>
      <Tabs defaultValue="activity"><TabsList><TabsTrigger value="activity">Atividade Recente</TabsTrigger><TabsTrigger value="info">Informações</TabsTrigger></TabsList>
        <TabsContent value="activity"><Card><CardContent className="pt-6">{stats?.recentActivity?.map((a, i) => <div key={i} className="flex items-center gap-4 py-3 border-b last:border-0"><Activity className="h-4 w-4 text-muted-foreground" /><span className="flex-1">{a.description}</span><span className="text-sm text-muted-foreground">{format(new Date(a.timestamp), 'dd/MM HH:mm')}</span></div>)}</CardContent></Card></TabsContent>
        <TabsContent value="info"><Card><CardContent className="pt-6 space-y-4"><div className="flex items-center gap-2"><Building className="h-4 w-4" /><span className="text-muted-foreground">Empresa:</span><span>{user?.company}</span></div><div className="flex items-center gap-2"><Shield className="h-4 w-4" /><span className="text-muted-foreground">Função:</span><Badge>{user?.role}</Badge></div><div className="flex items-center gap-2"><Calendar className="h-4 w-4" /><span className="text-muted-foreground">Membro desde:</span><span>{user?.createdAt && format(new Date(user.createdAt), 'dd/MM/yyyy')}</span></div></CardContent></Card></TabsContent>
      </Tabs>
    </div>
  );
}