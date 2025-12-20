import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MoreVertical, Edit, Key, Shield, UserX } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'viewer';
  is_active: boolean;
  last_login_at: string | null;
  avatar_url: string | null;
  mfa_enabled: boolean;
}

interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
  onResetPassword: (email: string) => void;
  onToggleStatus: (id: string, isActive: boolean) => void;
}

const roleLabels = {
  admin: 'Administrador',
  manager: 'Gerente',
  viewer: 'Visualizador',
};

const roleColors = {
  admin: 'destructive',
  manager: 'default',
  viewer: 'secondary',
} as const;

export const UserCard = React.memo(function UserCard({
  user,
  onEdit,
  onResetPassword,
  onToggleStatus,
}: UserCardProps) {
  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Card className={!user.is_active ? 'opacity-60' : ''}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Avatar>
              <AvatarImage src={user.avatar_url || undefined} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{user.name}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(user)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onResetPassword(user.email)}>
                <Key className="h-4 w-4 mr-2" />
                Redefinir senha
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onToggleStatus(user.id, user.is_active)}>
                <UserX className="h-4 w-4 mr-2" />
                {user.is_active ? 'Desativar' : 'Ativar'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={roleColors[user.role]}>{roleLabels[user.role]}</Badge>
            {user.mfa_enabled && (
              <Badge variant="outline" className="gap-1">
                <Shield className="h-3 w-3" />
                MFA
              </Badge>
            )}
            {!user.is_active && <Badge variant="secondary">Inativo</Badge>}
          </div>
          <span className="text-xs text-muted-foreground">
            {user.last_login_at 
              ? `Último acesso ${formatDistanceToNow(new Date(user.last_login_at), { addSuffix: true, locale: ptBR })}`
              : 'Nunca acessou'
            }
          </span>
        </div>
      </CardContent>
    </Card>
  );
});
