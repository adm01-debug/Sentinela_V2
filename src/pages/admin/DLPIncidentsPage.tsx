import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Incident {
  id: string;
  source_type: string;
  action_taken: string;
  severity: string;
  classifier_code: string | null;
  employee_name: string | null;
  device_name: string | null;
  match_count: number;
  match_summary: string | null;
  detected_at: string;
}

const severityColor: Record<string, string> = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-warning/15 text-warning',
  high: 'bg-destructive/15 text-destructive',
  critical: 'bg-destructive text-destructive-foreground',
};

const actionLabel: Record<string, string> = {
  alert: 'Alerta',
  redact: 'Redigido',
  block: 'Bloqueado',
};

export default function DLPIncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void load();

    const channel = supabase
      .channel('dlp-incidents-feed')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'dlp_incidents' },
        (payload) => {
          setIncidents((prev) => [payload.new as Incident, ...prev].slice(0, 100));
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from('dlp_incidents')
      .select('id, source_type, action_taken, severity, classifier_code, employee_name, device_name, match_count, match_summary, detected_at')
      .order('detected_at', { ascending: false })
      .limit(100);
    setIncidents((data as Incident[]) || []);
    setLoading(false);
  }

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-semibold">
          <ShieldAlert className="h-6 w-6 text-destructive" /> DLP — Incidentes
        </h1>
        <p className="text-sm text-muted-foreground">
          Detecções de dados sensíveis em tempo real.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Últimos 100 incidentes</CardTitle>
          <CardDescription>Atualizado em tempo real via Supabase Realtime.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : incidents.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhum incidente registrado ainda.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quando</TableHead>
                  <TableHead>Funcionário</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Classifier</TableHead>
                  <TableHead>Severidade</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead className="text-right">Matches</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incidents.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(i.detected_at), { addSuffix: true, locale: ptBR })}
                    </TableCell>
                    <TableCell>{i.employee_name || '—'}</TableCell>
                    <TableCell><Badge variant="outline">{i.source_type}</Badge></TableCell>
                    <TableCell className="font-mono text-xs">{i.classifier_code || '—'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={severityColor[i.severity]}>
                        {i.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>{actionLabel[i.action_taken] ?? i.action_taken}</TableCell>
                    <TableCell className="text-right tabular-nums">{i.match_count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
