import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Trophy, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Employee { 
  employee: string; 
  productivity: number; 
}

const rankColors = [
  'bg-warning/10 text-warning border-warning/30',
  'bg-muted text-muted-foreground border-border',
  'bg-muted text-muted-foreground border-border',
];

export const TopEmployeesList = ({ employees }: { employees: Employee[] }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-base">
        <Trophy className="h-4 w-4 text-warning" />
        Melhores Desempenhos
      </CardTitle>
    </CardHeader>
    <CardContent>
      {employees.length > 0 ? (
        <div className="space-y-3">
          {employees.map((emp, i) => (
            <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold border",
                  i < 3 ? rankColors[i] : 'bg-muted text-muted-foreground border-border'
                )}>
                  {i + 1}
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                    {emp.employee.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium text-sm text-card-foreground">{emp.employee}</span>
              </div>
              <span className={cn(
                "text-sm font-semibold",
                emp.productivity >= 80 ? "text-success" : emp.productivity >= 50 ? "text-warning" : "text-destructive"
              )}>
                {emp.productivity}%
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <Users className="h-10 w-10 mb-3 opacity-30" />
          <p className="text-sm font-medium">Sem dados ainda</p>
          <p className="text-xs">O ranking será exibido quando houver atividade</p>
        </div>
      )}
    </CardContent>
  </Card>
);
