import { useState } from 'react';
import { Plus, MoreVertical, Mail, Shield, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/DropdownMenu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { useTeamMembers, useInviteMember, useRemoveMember } from '@/hooks/useTeams';

export default function SettingsTeamPage() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');
  const { data: members } = useTeamMembers();
  const invite = useInviteMember();
  const remove = useRemoveMember();

  const handleInvite = async () => {
    await invite.mutateAsync({ email, role });
    setOpen(false);
    setEmail('');
  };

  const roleColors = { admin: 'destructive', manager: 'default', analyst: 'secondary', viewer: 'outline' };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h2 className="text-xl font-bold">Membros da Equipe</h2><p className="text-muted-foreground">{members?.length || 0} membros</p></div>
        <Button onClick={() => setOpen(true)}><Plus className="mr-2 h-4 w-4" />Convidar</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {members?.map(member => (
              <div key={member.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <Avatar><AvatarImage src={member.avatar} /><AvatarFallback>{member.name?.charAt(0)}</AvatarFallback></Avatar>
                  <div><p className="font-medium">{member.name}</p><p className="text-sm text-muted-foreground">{member.email}</p></div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={roleColors[member.role] as any}>{member.role}</Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem><Shield className="mr-2 h-4 w-4" />Alterar função</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => remove.mutate(member.id)}><Trash2 className="mr-2 h-4 w-4" />Remover</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Convidar membro</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@empresa.com" />
            <div><label className="text-sm font-medium">Função</label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="manager">Gerente</SelectItem>
                  <SelectItem value="analyst">Analista</SelectItem>
                  <SelectItem value="viewer">Visualizador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleInvite} loading={invite.isPending}><Mail className="mr-2 h-4 w-4" />Enviar convite</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}