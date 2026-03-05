import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useInviteUser } from '@/hooks/useUsers';

export default function UserInvitePage() {
  const navigate = useNavigate();
  const invite = useInviteUser();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await invite.mutateAsync({ email, role });
    navigate('/users');
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4"><ArrowLeft className="mr-2 h-4 w-4" />Voltar</Button>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5" />Convidar Usuários</CardTitle><CardDescription>Envie convites para novos membros da equipe</CardDescription></CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div><label className="text-sm font-medium">Email</label><Input type="email" placeholder="email@empresa.com" value={email} onChange={e => setEmail(e.target.value)} /></div>
            <div><label className="text-sm font-medium">Função</label><Select value={role} onValueChange={setRole}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="admin">Administrador</SelectItem><SelectItem value="manager">Gerente</SelectItem><SelectItem value="analyst">Analista</SelectItem><SelectItem value="viewer">Visualizador</SelectItem></SelectContent></Select></div>
            <div><label className="text-sm font-medium">Mensagem personalizada (opcional)</label><Textarea placeholder="Bem-vindo à equipe!" value={message} onChange={e => setMessage(e.target.value)} /></div>
          </CardContent>
          <CardFooter className="gap-2"><Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancelar</Button><Button type="submit"><Mail className="mr-2 h-4 w-4" />Enviar Convite</Button></CardFooter>
        </form>
      </Card>
    </div>
  );
}
