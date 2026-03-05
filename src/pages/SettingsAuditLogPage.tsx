import { useState } from 'react';
import { format } from 'date-fns';
import { Search, Filter, Download, User, Clock, Activity } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DatePicker } from '@/components/ui/DatePicker';
import { useAuditLog } from '@/hooks/useAuditLog';

export default function SettingsAuditLogPage() {
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('');
  const [date, setDate] = useState<Date>();
  const { data: logs } = useAuditLog();

  const filteredLogs = (logs || []).filter((log: any) => {
    if (search && !log.action?.toLowerCase().includes(search.toLowerCase())) return false;
    if (action && action !== 'all' && log.action !== action) return false;
    return true;
  });

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
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {filteredLogs.map((log: any) => (
              <div key={log.id} className="p-4 hover:bg-accent/50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <Activity className="h-4 w-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="font-medium">{log.action}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><User className="h-3 w-3" />{log.user_email}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{format(new Date(log.created_at), 'dd/MM/yyyy HH:mm')}</span>
                      </div>
                    </div>
                  </div>
                  <Badge>{log.action}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
