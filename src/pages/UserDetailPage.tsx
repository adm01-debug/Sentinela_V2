import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Building, Calendar, Shield, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/hooks/useUsers';

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: user, isLoading } = useUser(id!);

  if (isLoading) return <div className="p-6"><Skeleton className="h-96" /></div>;
  if (!user) return <div className="p-6">Usuário não encontrado</div>;

  return (
    <div className="p-6 space-y-6">
      <Button variant="ghost" onClick={() => navigate(-1)}><ArrowLeft className="mr-2 h-4 w-4" />Voltar</Button>
      <div className="flex items-start gap-6">
        <Avatar className="h-24 w-24"><AvatarImage src={user.avatar} /><AvatarFallback className="text-2xl">{user.name?.charAt(0)}</AvatarFallback></Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-4"><h1 className="text-2xl font-bold">{user.name}</h1><Badge>{String((user.role as any)?.name || user.role || '')}</Badge></div>
          <div className="flex items-center gap-6 mt-4 text-muted-foreground">
            <span className="flex items-center gap-2"><Mail className="h-4 w-4" />{user.email}</span>
            {(user as any).phone && <span className="flex items-center gap-2">{(user as any).phone}</span>}
            {(user as any).department && <span className="flex items-center gap-2"><Building className="h-4 w-4" />{String(((user as any).department as any)?.name || (user as any).department || '')}</span>}
          </div>
        </div>
        <Link to={`/users/${id}/edit`}><Button>Editar</Button></Link>
      </div>
      <Tabs defaultValue="permissions">
        <TabsList><TabsTrigger value="permissions">Permissões</TabsTrigger></TabsList>
        <TabsContent value="permissions" className="mt-4">
          <Card><CardHeader><CardTitle>Permissões</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Função: {String((user.role as any)?.name || user.role || '')}</p></CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
