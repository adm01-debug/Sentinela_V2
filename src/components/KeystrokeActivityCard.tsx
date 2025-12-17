import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Keyboard, Clock, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface KeystrokeLog {
  id: string;
  employee_name: string;
  device: string | null;
  app_name: string | null;
  keystrokes_count: number;
  active_time_seconds: number;
  idle_time_seconds: number;
  recorded_at: string;
}

export function KeystrokeActivityCard() {
  const [logs, setLogs] = useState<KeystrokeLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('keystroke_logs')
        .select('*')
        .order('recorded_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching keystroke logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-primary" />
            Atividade de Teclas
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Keyboard className="h-5 w-5 text-primary" />
          Atividade de Teclas
        </CardTitle>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Nenhum registro de atividade
          </p>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div className="flex-1">
                  <p className="font-medium">{log.employee_name}</p>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <span>{log.app_name || 'Sistema'}</span>
                    {log.device && <Badge variant="outline" className="text-xs">{log.device}</Badge>}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{log.keystrokes_count.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">teclas</p>
                </div>
                <div className="text-right ml-4">
                  <div className="flex items-center gap-1 text-sm">
                    <Clock className="h-3 w-3" />
                    <span className="text-green-500">{formatTime(log.active_time_seconds)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    idle: {formatTime(log.idle_time_seconds)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
