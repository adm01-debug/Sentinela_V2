import { memo } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import type { EmployeeProductivity } from '@/hooks/useProductivityComparison';

interface ProductivityTableProps {
  employees: EmployeeProductivity[];
  isLoading?: boolean;
}

function ProductivityTableComponent({ employees, isLoading }: ProductivityTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum funcionário encontrado
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Funcionário</TableHead>
          <TableHead>Departamento</TableHead>
          <TableHead>Produtividade</TableHead>
          <TableHead>Tempo Ativo</TableHead>
          <TableHead>Atividade</TableHead>
          <TableHead>Violações</TableHead>
          <TableHead>Tendência</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {employees.map((emp) => (
          <TableRow key={emp.id}>
            <TableCell>
              <div className="font-medium">{emp.full_name}</div>
              {emp.team && (
                <div className="text-sm text-muted-foreground">{emp.team}</div>
              )}
            </TableCell>
            <TableCell>
              <Badge variant="outline">{emp.department || '-'}</Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Progress
                  value={emp.productivity_score}
                  className="w-16 h-2"
                />
                <span className="text-sm font-medium">{emp.productivity_score}%</span>
              </div>
            </TableCell>
            <TableCell>
              <div className="text-sm">
                <div>{emp.active_time_hours}h ativo</div>
                <div className="text-muted-foreground">{emp.idle_time_hours}h ocioso</div>
              </div>
            </TableCell>
            <TableCell>
              <div className="text-sm">
                <div>{emp.keystrokes.toLocaleString()} teclas</div>
                <div className="text-muted-foreground">{emp.mouse_clicks.toLocaleString()} cliques</div>
              </div>
            </TableCell>
            <TableCell>
              {emp.violations_count > 0 ? (
                <Badge variant="destructive">{emp.violations_count}</Badge>
              ) : (
                <Badge variant="secondary">0</Badge>
              )}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                {getTrendIcon(emp.trend)}
                <span className={`text-sm ${
                  emp.trend_percentage > 0 ? 'text-green-600' : 
                  emp.trend_percentage < 0 ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {emp.trend_percentage > 0 ? '+' : ''}{emp.trend_percentage}%
                </span>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export const ProductivityTable = memo(ProductivityTableComponent);
