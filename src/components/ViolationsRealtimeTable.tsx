import { memo, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SecurityViolation } from '@/hooks/useSecurityViolations';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { AlertTriangle, ShieldAlert, AlertCircle, Info, Eye, CheckCircle, Search, Filter } from 'lucide-react';

interface ViolationsRealtimeTableProps {
  violations: SecurityViolation[];
  onMarkAsRead: (id: string) => void;
}

const severityConfig = {
  critical: { icon: ShieldAlert, color: 'bg-destructive text-destructive-foreground', label: 'Crítico' },
  high: { icon: AlertTriangle, color: 'bg-orange-500 text-white', label: 'Alto' },
  medium: { icon: AlertCircle, color: 'bg-yellow-500 text-black', label: 'Médio' },
  low: { icon: Info, color: 'bg-blue-500 text-white', label: 'Baixo' },
};

function ViolationsRealtimeTableBase({ violations, onMarkAsRead }: ViolationsRealtimeTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [employeeFilter, setEmployeeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Get unique values for filters
  const types = [...new Set(violations.map(v => v.violation_type))];
  const employees = [...new Set(violations.map(v => v.employee_name))];

  // Filter violations
  const filteredViolations = violations.filter(v => {
    const matchesSearch = 
      v.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.policy_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.violation_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSeverity = severityFilter === 'all' || v.severity === severityFilter;
    const matchesType = typeFilter === 'all' || v.violation_type === typeFilter;
    const matchesEmployee = employeeFilter === 'all' || v.employee_name === employeeFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'unread' && !v.read) || 
      (statusFilter === 'read' && v.read);

    return matchesSearch && matchesSeverity && matchesType && matchesEmployee && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por funcionário, política ou tipo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-[140px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Severidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="critical">Crítico</SelectItem>
            <SelectItem value="high">Alto</SelectItem>
            <SelectItem value="medium">Médio</SelectItem>
            <SelectItem value="low">Baixo</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {types.map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Funcionário" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {employees.map(emp => (
              <SelectItem key={emp} value={emp}>{emp}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="unread">Não lidas</SelectItem>
            <SelectItem value="read">Lidas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="text-sm text-muted-foreground">
        {filteredViolations.length} violações encontradas
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[50px]">Status</TableHead>
              <TableHead className="w-[100px]">Severidade</TableHead>
              <TableHead>Funcionário</TableHead>
              <TableHead>Política</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Dispositivo</TableHead>
              <TableHead>Data/Hora</TableHead>
              <TableHead className="w-[80px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredViolations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Nenhuma violação encontrada
                </TableCell>
              </TableRow>
            ) : (
              filteredViolations.map((violation) => {
                const config = severityConfig[violation.severity];
                const Icon = config.icon;
                
                return (
                  <TableRow 
                    key={violation.id} 
                    className={`${!violation.read ? 'bg-primary/5' : ''} hover:bg-muted/50 transition-colors`}
                  >
                    <TableCell>
                      {violation.read ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${config.color} gap-1`}>
                        <Icon className="h-3 w-3" />
                        {config.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{violation.employee_name}</TableCell>
                    <TableCell>{violation.policy_name}</TableCell>
                    <TableCell>{violation.violation_type}</TableCell>
                    <TableCell className="text-muted-foreground">{violation.device || '-'}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(violation.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      {!violation.read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onMarkAsRead(violation.id)}
                          title="Marcar como lida"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// Memo wrappers
export const ViolationsRealtimeTable = memo(ViolationsRealtimeTableBase);
