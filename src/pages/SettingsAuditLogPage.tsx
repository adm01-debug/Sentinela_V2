import { useState } from 'react';
import { format } from 'date-fns';
import { Search, Filter, Download, User, Clock, Activity } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { DatePicker } from '@/components/ui/DatePicker';
import { useAuditLogs } from '@/hooks/useAuditLog';

export default function SettingsAuditLogPage() {
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('');
  const [date, setDate] = useState<Date>();
  const { data: logs, isLoading } = useAuditLogs({ search, action, date: date?.toISOString() });

  const actionColors = { create: 'bg-green-100 text-green-800', update: 'bg-blue-100 text-blue-800', delete: 'bg-red-100 text-red-800', login: 'bg-purple-100 text-purple-800' };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h2 className="text-xl font-bold">Log de Auditoria</h2><p className="text-muted-foreground">Histórico de ações do sistema</p></div>
        <Button variant="outline"><Download className="mr-2 h-4 w-4" />Exportar</Button>
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} /></div>
        <Select value={action} onValueChange={setAction}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Ação" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="create">Criar</SelectItem>
            <SelectItem value="update">Atualizar</SelectItem>
            <SelectItem value="delete">Excluir</SelectItem>
            <SelectItem value="login">Login</SelectItem>
          </SelectContent>
        </Select>
        <DatePicker date={date} onDateChange={setDate} placeholder="Data" />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {logs?.map(log => (
              <div key={log.id} className="p-4 hover:bg-accent/50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="mt-1"><Activity className="h-4 w-4 text-muted-foreground" /></div>
                    <div>
                      <p className="font-medium">{log.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><User className="h-3 w-3" />{log.userName}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm')}</span>
                      </div>
                    </div>
                  </div>
                  <Badge className={actionColors[log.action]}>{log.action}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}