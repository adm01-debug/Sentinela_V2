import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Clock, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ProductivityLog {
  id: string;
  employee_name: string;
  device: string | null;
  productive_time_seconds: number;
  unproductive_time_seconds: number;
  neutral_time_seconds: number;
  apps_used: unknown;
  recorded_date: string;
}

export function ProductivityCard() {
  const [logs, setLogs] = useState<ProductivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('productivity_logs')
        .select('*')
        .order('recorded_date', { ascending: false })
        .limit(10);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching productivity logs:', error);
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

  const getProductivityScore = (log: ProductivityLog) => {
    const total = log.productive_time_seconds + log.unproductive_time_seconds + log.neutral_time_seconds;
    if (total === 0) return 0;
    return Math.round((log.productive_time_seconds / total) * 100);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Produtividade
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
          <TrendingUp className="h-5 w-5 text-primary" />
          Produtividade
        </CardTitle>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Nenhum registro de produtividade
          </p>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => {
              const score = getProductivityScore(log);
              return (
                <div key={log.id} className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium">{log.employee_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.recorded_date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${getScoreColor(score)}`}>
                        {score}%
                      </p>
                      <p className="text-xs text-muted-foreground">produtivo</p>
                    </div>
                  </div>
                  <Progress value={score} className="h-2 mb-2" />
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      Produtivo: {formatTime(log.productive_time_seconds)}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      Improdutivo: {formatTime(log.unproductive_time_seconds)}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-gray-500" />
                      Neutro: {formatTime(log.neutral_time_seconds)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
