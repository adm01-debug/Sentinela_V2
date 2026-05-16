import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/layout/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

interface AuditEvent {
  id: string;
  type: string;
  detail: string;
  ip?: string | null;
  created_at: string;
  source: 'security' | 'settings';
}

export default function AuditLogPage() {
  const [search, setSearch] = useState('');
  const [eventType, setEventType] = useState('all');
  const [tab, setTab] = useState('all');

  const { data: events, isLoading } = useQuery({
    queryKey: ['audit-log-combined', eventType],
    queryFn: async (): Promise<AuditEvent[]> => {
      const results: AuditEvent[] = [];

      // Security events (login, logout, failed_login, etc.)
      let secQuery = supabase.from('login_security_events').select('*').order('created_at', { ascending: false }).limit(100);
      if (eventType !== 'all' && ['login', 'logout', 'failed_login', 'password_reset'].includes(eventType)) {
        secQuery = secQuery.eq('event_type', eventType);
      }
      const { data: secData } = await secQuery;
      for (const e of secData ?? []) {
        results.push({
          id: e.id,
          type: e.event_type,
          detail: e.user_agent?.slice(0, 80) || 'N/A',
          ip: e.ip_address,
          created_at: e.created_at,
          source: 'security',
        });
      }

      // Settings audit log
      let settingsQuery = supabase.from('settings_audit_log').select('*').order('created_at', { ascending: false }).limit(100);
      if (eventType !== 'all' && ['create', 'update', 'delete'].includes(eventType)) {
        settingsQuery = settingsQuery.eq('action', eventType);
      }
      const { data: settingsData } = await settingsQuery;
      for (const e of settingsData ?? []) {
        results.push({
          id: e.id,
          type: `settings.${e.action}`,
          detail: `${e.entity_type}: ${e.entity_name || e.entity_id}`,
          ip: null,
          created_at: e.created_at,
          source: 'settings',
        });
      }

      return results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    },
  });

  const filtered = (events || [])
    .filter(e => tab === 'all' || e.source === tab)
    .filter(e => !search || e.type.includes(search) || e.detail.toLowerCase().includes(search.toLowerCase()) || e.ip?.includes(search));

  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 5,
  });

  if (isLoading) return <div className="p-6"><Skeleton className="h-96" /></div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Logs de Auditoria"
        description="Histórico completo de ações e eventos do sistema"
        showBackButton={false}
      />


      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por tipo, detalhe ou IP..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={eventType} onValueChange={setEventType}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="login">Login</SelectItem>
            <SelectItem value="logout">Logout</SelectItem>
            <SelectItem value="failed_login">Login Falho</SelectItem>
            <SelectItem value="password_reset">Reset Senha</SelectItem>
            <SelectItem value="create">Criação</SelectItem>
            <SelectItem value="update">Atualização</SelectItem>
            <SelectItem value="delete">Exclusão</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">Todos ({events?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="security">Segurança ({events?.filter(e => e.source === 'security').length ?? 0})</TabsTrigger>
          <TabsTrigger value="settings">Configurações ({events?.filter(e => e.source === 'settings').length ?? 0})</TabsTrigger>
        </TabsList>
      </Tabs>

      {filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground"><FileText className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>Nenhum evento encontrado.</p></CardContent></Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div
              ref={parentRef}
              className="h-[600px] overflow-auto"
            >
              <div
                style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
                  width: '100%',
                  position: 'relative',
                }}
              >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const event = filtered[virtualRow.index];
                  return (
                    <div
                      key={`${event.source}-${event.id}`}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                      className="flex items-center justify-between p-4 border-b hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={event.source === 'security' ? 'destructive' : 'outline'}>{event.type}</Badge>
                          {event.ip && <span className="text-xs text-muted-foreground">IP: {event.ip}</span>}
                          <Badge variant="secondary" className="text-[10px]">{event.source === 'security' ? 'Segurança' : 'Config'}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 truncate">{event.detail}</p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                        {format(new Date(event.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export { AuditLogPage };
