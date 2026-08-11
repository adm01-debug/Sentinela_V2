import { useState } from 'react';
import { format, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock, Monitor } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/DatePicker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/Skeleton';
import { useActivities } from '@/hooks/useActivities';
import { useEmployees } from '@/hooks/useEmployees';

interface Employee {
  id: string;
  name: string;
}

interface Activity {
  application?: string;
  windowTitle?: string;
  title?: string;
  timestamp?: string;
  duration?: number;
}

interface DataWithArray {
  data?: Employee[] | Activity[];
}

const safeTime = (timestamp?: string) => {
  if (!timestamp) return '--:--';
  const date = new Date(timestamp);
  return isValid(date) ? format(date, 'HH:mm') : '--:--';
};

export default function ActivityTimelinePage() {
  const [date, setDate] = useState<Date>(new Date());
  const [employeeId, setEmployeeId] = useState<string>('');
  const { data: employeesData } = useEmployees();
  const { data: activitiesData, isLoading } = useActivities({ startDate: date.toISOString().split('T')[0], endDate: date.toISOString().split('T')[0], employee_name: employeeId || undefined });

  const employees = (Array.isArray(employeesData) ? employeesData : (employeesData as DataWithArray)?.data || []) as Employee[];
  const activities = (Array.isArray(activitiesData) ? activitiesData : (activitiesData as DataWithArray)?.data || []) as Activity[];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Timeline de Atividades</h1>
        <div className="flex gap-4">
          <Select value={employeeId} onValueChange={setEmployeeId}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Funcionário" /></SelectTrigger>
            <SelectContent>{employees?.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
          </Select>
          <DatePicker date={date} onDateChange={(d: Date | undefined) => d && setDate(d)} />
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" />{format(date, "EEEE, d 'de' MMMM", { locale: ptBR })}</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-16" />)}</div>
          ) : activities?.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Nenhuma atividade registrada neste dia.</p>
          ) : (
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
              <div className="space-y-6">
                {activities?.map((activity, index) => (
                  <div key={index} className="relative pl-10">
                    <div className="absolute left-2.5 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                    <div className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Monitor className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{activity.application}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{activity.windowTitle || activity.title}</p>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {safeTime(activity.timestamp)} - {Math.max(0, Math.round((activity.duration || 0) / 60))}min
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
