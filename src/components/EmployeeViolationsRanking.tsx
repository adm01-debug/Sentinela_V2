import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Trophy, Medal, Award, AlertTriangle } from 'lucide-react';
import { useSecurityViolations } from '@/hooks/useSecurityViolations';

interface EmployeeRanking {
  name: string;
  totalViolations: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
}

export function EmployeeViolationsRanking() {
  const { violations, loading } = useSecurityViolations();

  const ranking = useMemo(() => {
    const employeeMap = new Map<string, EmployeeRanking>();

    violations.forEach((violation) => {
      const existing = employeeMap.get(violation.employee_name) || {
        name: violation.employee_name,
        totalViolations: 0,
        criticalCount: 0,
        highCount: 0,
        mediumCount: 0,
        lowCount: 0,
      };

      existing.totalViolations += 1;
      if (violation.severity === 'critical') existing.criticalCount += 1;
      else if (violation.severity === 'high') existing.highCount += 1;
      else if (violation.severity === 'medium') existing.mediumCount += 1;
      else existing.lowCount += 1;

      employeeMap.set(violation.employee_name, existing);
    });

    return Array.from(employeeMap.values())
      .sort((a, b) => b.totalViolations - a.totalViolations)
      .slice(0, 10);
  }, [violations]);

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (index === 1) return <Medal className="h-5 w-5 text-gray-400" />;
    if (index === 2) return <Award className="h-5 w-5 text-amber-600" />;
    return <span className="w-5 text-center text-sm text-muted-foreground">{index + 1}</span>;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Ranking de Violações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (ranking.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Ranking de Violações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Nenhuma violação registrada
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          Ranking de Violações
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {ranking.map((employee, index) => (
            <div
              key={employee.name}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="flex items-center justify-center w-6">
                {getRankIcon(index)}
              </div>
              
              <Avatar className="h-9 w-9">
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {getInitials(employee.name)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{employee.name}</p>
                <div className="flex gap-1 mt-1">
                  {employee.criticalCount > 0 && (
                    <Badge variant="destructive" className="text-xs px-1.5 py-0">
                      {employee.criticalCount} críticas
                    </Badge>
                  )}
                  {employee.highCount > 0 && (
                    <Badge variant="outline" className="text-xs px-1.5 py-0 border-orange-500 text-orange-500">
                      {employee.highCount} altas
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-2xl font-bold text-destructive">
                  {employee.totalViolations}
                </p>
                <p className="text-xs text-muted-foreground">violações</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
