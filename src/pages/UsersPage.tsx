import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, MoreVertical, Mail, Shield, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useUsers } from '@/hooks/useUsers';

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const { data: users } = useUsers();
  const filtered = (users || []).filter(u => !search || u.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Usuários</h1>
        <Link to="/users/invite"><Button><Plus className="mr-2 h-4 w-4" />Convidar</Button></Link>
      </div>
      <div className="relative max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar usuários..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} /></div>
      <Card>
        <CardContent className="p-0 divide-y">
          {filtered.map(user => (
            <div key={user.id} className="flex items-center justify-between p-4 hover:bg-accent/50">
              <Link to={`/users/${user.id}`} className="flex items-center gap-4 flex-1">
                <Avatar><AvatarImage src={user.avatar} /><AvatarFallback>{user.name?.charAt(0)}</AvatarFallback></Avatar>
                <div><p className="font-medium">{user.name}</p><p className="text-sm text-muted-foreground">{user.email}</p></div>
              </Link>
              <div className="flex items-center gap-4">
                <Badge>{typeof user.role === 'object' ? String((user.role as { name?: string })?.name || '') : String(user.role || '')}</Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem><Mail className="mr-2 h-4 w-4" />Enviar email</DropdownMenuItem>
                    <DropdownMenuItem><Shield className="mr-2 h-4 w-4" />Alterar função</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Remover</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
