import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';

interface ActivityHeatmapProps {
  keystrokes: Array<{ recorded_at: string; employee_name: string }>;
  clicks: Array<{ recorded_at: string; employee_name: string }>;
}

export const ActivityHeatmap = ({ keystrokes, clicks }: ActivityHeatmapProps) => {
  // Group activity by hour
  const hourlyActivity = Array.from({ length: 24 }, (_, hour) => {
    const keystrokesInHour = keystrokes.filter(
      (k) => new Date(k.recorded_at).getHours() === hour
    ).length;
    const clicksInHour = clicks.filter(
      (c) => new Date(c.recorded_at).getHours() === hour
    ).length;
    return {
      hour,
      keystrokes: keystrokesInHour,
      clicks: clicksInHour,
      total: keystrokesInHour + clicksInHour,
    };
  });

  const maxActivity = Math.max(...hourlyActivity.map((h) => h.total), 1);

  const getIntensityClass = (value: number) => {
    const intensity = value / maxActivity;
    if (intensity === 0) return 'bg-muted';
    if (intensity < 0.25) return 'bg-primary/20';
    if (intensity < 0.5) return 'bg-primary/40';
    if (intensity < 0.75) return 'bg-primary/60';
    return 'bg-primary';
  };

  // Group activity by employee
  const employeeActivity = new Map<string, { keystrokes: number; clicks: number }>();
  keystrokes.forEach((k) => {
    const current = employeeActivity.get(k.employee_name) || { keystrokes: 0, clicks: 0 };
    employeeActivity.set(k.employee_name, { ...current, keystrokes: current.keystrokes + 1 });
  });
  clicks.forEach((c) => {
    const current = employeeActivity.get(c.employee_name) || { keystrokes: 0, clicks: 0 };
    employeeActivity.set(c.employee_name, { ...current, clicks: current.clicks + 1 });
  });

  const sortedEmployees = Array.from(employeeActivity.entries())
    .map(([name, data]) => ({ name, ...data, total: data.keystrokes + data.clicks }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="h-5 w-5 text-primary" />
          Mapa de Atividade
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Hourly heatmap */}
        <div>
          <p className="text-sm text-muted-foreground mb-2">Atividade por Hora</p>
          <div className="flex gap-1">
            {hourlyActivity.map((hour) => (
              <div
                key={hour.hour}
                className={`flex-1 h-8 rounded ${getIntensityClass(hour.total)} transition-colors`}
                title={`${hour.hour}h: ${hour.keystrokes} teclas, ${hour.clicks} cliques`}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>0h</span>
            <span>6h</span>
            <span>12h</span>
            <span>18h</span>
            <span>23h</span>
          </div>
        </div>

        {/* Top employees */}
        <div>
          <p className="text-sm text-muted-foreground mb-2">Funcionários Mais Ativos</p>
          {sortedEmployees.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma atividade registrada
            </p>
          ) : (
            <div className="space-y-2">
              {sortedEmployees.map((employee) => {
                const percentage = (employee.total / (sortedEmployees[0]?.total || 1)) * 100;
                return (
                  <div key={employee.name} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="truncate">{employee.name}</span>
                      <span className="text-muted-foreground">
                        {employee.total.toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
