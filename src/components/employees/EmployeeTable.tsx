import { memo } from 'react';
import { Link } from 'react-router-dom';
import { MoreHorizontal, Eye, Edit, Trash2, Mail, Phone } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// ============================================================
// TYPES
// ============================================================

export interface Employee {
  id: string;
  name: string;
  email: string;
  department?: string;
  position?: string;
  status: 'active' | 'inactive' | 'suspended';
  avatar_url?: string;
  phone?: string;
  team?: {
    id: string;
    name: string;
  };
  last_activity_at?: string;
  created_at: string;
}

export interface EmployeeTableProps {
  employees: Employee[];
  selectedIds: string[];
  onSelectAll: (checked: boolean) => void;
  onSelectOne: (id: string, checked: boolean) => void;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
  isLoading?: boolean;
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getStatusBadge(status: Employee['status']) {
  switch (status) {
    case 'active':
      return <Badge variant="default" className="bg-green-500">Ativo</Badge>;
    case 'inactive':
      return <Badge variant="secondary">Inativo</Badge>;
    case 'suspended':
      return <Badge variant="destructive">Suspenso</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// ============================================================
// COMPONENT
// ============================================================

export const EmployeeTable = memo(function EmployeeTable({
  employees,
  selectedIds,
  onSelectAll,
  onSelectOne,
  onEdit,
  onDelete,
  isLoading = false,
}: EmployeeTableProps) {
  const allSelected = employees.length > 0 && selectedIds.length === employees.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < employees.length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-muted-foreground">Nenhum funcionário encontrado</p>
        <p className="text-sm text-muted-foreground mt-1">
          Tente ajustar os filtros ou adicione novos funcionários
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                onCheckedChange={onSelectAll}
                aria-label="Selecionar todos"
              />
            </TableHead>
            <TableHead>Funcionário</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Departamento</TableHead>
            <TableHead>Equipe</TableHead>
            <TableHead>Última Atividade</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell>
                <Checkbox
                  checked={selectedIds.includes(employee.id)}
                  onCheckedChange={(checked) => onSelectOne(employee.id, !!checked)}
                  aria-label={`Selecionar ${employee.name}`}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={employee.avatar_url} alt={employee.name} />
                    <AvatarFallback>{getInitials(employee.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <Link
                      to={`/employees/${employee.id}`}
                      className="font-medium hover:underline"
                    >
                      {employee.name}
                    </Link>
                    <p className="text-sm text-muted-foreground">{employee.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(employee.status)}</TableCell>
              <TableCell>
                <span className="text-muted-foreground">
                  {employee.department || '-'}
                </span>
              </TableCell>
              <TableCell>
                {employee.team ? (
                  <Badge variant="outline">{employee.team.name}</Badge>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>
                {employee.last_activity_at ? (
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(employee.last_activity_at), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </span>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Abrir menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to={`/employees/${employee.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver detalhes
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(employee)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    {employee.email && (
                      <DropdownMenuItem asChild>
                        <a href={`mailto:${employee.email}`}>
                          <Mail className="mr-2 h-4 w-4" />
                          Enviar email
                        </a>
                      </DropdownMenuItem>
                    )}
                    {employee.phone && (
                      <DropdownMenuItem asChild>
                        <a href={`tel:${employee.phone}`}>
                          <Phone className="mr-2 h-4 w-4" />
                          Ligar
                        </a>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => onDelete(employee)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
});
