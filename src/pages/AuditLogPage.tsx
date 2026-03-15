import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Search, Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AuditLogPage() {
  const [search, setSearch] = useState('');
  const [eventType, setEventType] = useState('all');

  const { data: events, isLoading } = useQuery({
    queryKey: ['audit-log', eventType],
    queryFn: async () => {
      let query = supabase.from('login_security_events').select('*').order('created_at', { ascending: false }).limit(100);
      if (eventType !== 'all') query = query.eq('event_type', eventType);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const filtered = (events || []).filter(e => !search || e.event_type.includes(search) || e.ip_address?.includes(search));

  if (isLoading) return <div className="p-6"><Skeleton className="h-96" /></div>;

  return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-2xl font-bold flex items-center gap-2"><FileText className="h-6 w-6 text-primary" />Logs de Auditoria</h1><p className="text-muted-foreground mt-1">Histórico de ações e eventos do sistema</p></div>
      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} /></div>
        <Select value={eventType} onValueChange={setEventType}><SelectTrigger className="w-[180px]"><SelectValue placeholder="Tipo" /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem><SelectItem value="login">Login</SelectItem><SelectItem value="logout">Logout</SelectItem><SelectItem value="failed_login">Login Falho</SelectItem><SelectItem value="password_reset">Reset Senha</SelectItem></SelectContent></Select>
      </div>
      {filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground"><FileText className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>Nenhum evento encontrado.</p></CardContent></Card>
      ) : (
        <Card><CardContent className="p-0 divide-y">
          {filtered.map(event => (
            <div key={event.id} className="flex items-center justify-between p-4 hover:bg-accent/50">
              <div className="flex-1">
                <div className="flex items-center gap-2"><Badge variant="outline">{event.event_type}</Badge>{event.ip_address && <span className="text-xs text-muted-foreground">IP: {event.ip_address}</span>}</div>
                <p className="text-sm text-muted-foreground mt-1">{event.user_agent?.slice(0, 60) || 'N/A'}</p>
              </div>
              <span className="text-xs text-muted-foreground">{format(new Date(event.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
            </div>
          ))}
        </CardContent></Card>
      )}
    </div>
  );
}

export { AuditLogPage };
