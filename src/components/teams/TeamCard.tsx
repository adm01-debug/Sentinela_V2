import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Edit, Trash2, Crown } from 'lucide-react';

interface Team {
  id: string;
  name: string;
  description?: string;
  manager_name?: string;
  is_active: boolean;
  members_count: number;
}

interface TeamCardProps {
  team: Team;
  onEdit: (team: Team) => void;
  onDelete: (team: Team) => void;
  onViewMembers: (team: Team) => void;
}

function TeamCardComponent({ team, onEdit, onDelete, onViewMembers }: TeamCardProps) {
  return (
    <Card className={!team.is_active ? 'opacity-60' : ''}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>{team.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">{team.name}</CardTitle>
              {team.description && (
                <p className="text-sm text-muted-foreground line-clamp-1">{team.description}</p>
              )}
            </div>
          </div>
          <Badge variant={team.is_active ? 'default' : 'secondary'}>
            {team.is_active ? 'Ativa' : 'Inativa'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          {team.manager_name && (
            <span className="flex items-center gap-1">
              <Crown className="h-3 w-3" />
              {team.manager_name}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {team.members_count} membros
          </span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={() => onViewMembers(team)}>
            <Users className="h-3 w-3 mr-1" />
            Membros
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onEdit(team)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(team)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export const TeamCard = memo(TeamCardComponent);
