import { Employee } from '@/types';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Mail, Phone } from 'lucide-react';

interface Props {
  employee: Employee;
}

export const EmployeeHeader = ({ employee }: Props) => {
  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName = (employee as { full_name?: string; name?: string }).full_name ?? (employee as { name?: string }).name ?? 'Sem nome';
  const avatarSrc = (employee as { avatar_url?: string; avatar?: string }).avatar_url ?? (employee as { avatar?: string }).avatar;
  const roleLabel = (employee as { role?: string; position?: string }).role ?? (employee as { position?: string }).position ?? '-';
  const departmentLabel = (employee as { department?: string }).department ?? '-';

  return (
    <div className="flex items-start justify-between bg-card rounded-lg p-6">
      <div className="flex gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={avatarSrc} alt={displayName} />
          <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{displayName}</h1>
            <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
              {employee.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            {roleLabel} - {departmentLabel}
          </p>
          <div className="flex gap-4 mt-2 text-sm">
            <span className="flex items-center gap-1">
              <Mail className="h-4 w-4" /> {employee.email}
            </span>
            {employee.phone && (
              <span className="flex items-center gap-1">
                <Phone className="h-4 w-4" /> {employee.phone}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline">
          <Edit className="h-4 w-4 mr-2" /> Edit
        </Button>
        <Button variant="destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
