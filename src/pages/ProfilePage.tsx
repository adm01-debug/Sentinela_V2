import { Link } from 'react-router-dom';
import { User, Mail, Phone, Building, Calendar, Edit, Shield, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="text-2xl">{user?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{user?.name}</h1>
            <p className="text-muted-foreground">{user?.role}</p>
            <div className="flex items-center gap-4 mt-2">
              <span className="flex items-center gap-1 text-sm"><Mail className="h-4 w-4" />{user?.email}</span>
              {(user as any)?.phone && <span className="flex items-center gap-1 text-sm"><Phone className="h-4 w-4" />{(user as any)?.phone}</span>}
            </div>
          </div>
        </div>
        <Link to="/profile/edit"><Button><Edit className="mr-2 h-4 w-4" />Editar Perfil</Button></Link>
      </div>

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Informações</TabsTrigger>
        </TabsList>
        <TabsContent value="info">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="text-muted-foreground">Função:</span>
                <Badge>{user?.role}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="text-muted-foreground">Membro desde:</span>
                <span>{(user as any)?.createdAt && format(new Date((user as any).createdAt), 'dd/MM/yyyy')}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
