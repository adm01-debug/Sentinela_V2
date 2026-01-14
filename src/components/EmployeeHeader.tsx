import { Employee } from '@/types';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Mail, Phone } from 'lucide-react';

interface Props {
  employee: Employee;
}

export const EmployeeHeader = ({ employee }: Props) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex items-start justify-between bg-card rounded-lg p-6">
      <div className="flex gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={employee.avatar} alt={employee.name} />
          <AvatarFallback>{getInitials(employee.name)}</AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{employee.name}</h1>
            <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
              {employee.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            {employee.role} - {employee.department}
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
