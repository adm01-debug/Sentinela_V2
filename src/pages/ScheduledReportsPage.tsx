import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Clock, Calendar, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function ScheduledReportsPage() {
  const { data: reports, isLoading } = useQuery({
    queryKey: ['scheduled-reports'],
    queryFn: async () => {
      const { data, error } = await supabase.from('ai_analysis_reports').select('*').order('created_at', { ascending: false }).limit(20);
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div className="p-6"><Skeleton className="h-96" /></div>;

  return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-2xl font-bold flex items-center gap-2"><Clock className="h-6 w-6 text-primary" />Relatórios Agendados</h1><p className="text-muted-foreground mt-1">Configure relatórios automáticos e periódicos</p></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-4 text-center"><Calendar className="h-5 w-5 mx-auto text-primary" /><p className="text-2xl font-bold mt-1">{reports?.length || 0}</p><p className="text-xs text-muted-foreground">Relatórios Gerados</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><Clock className="h-5 w-5 mx-auto text-blue-500" /><p className="text-2xl font-bold mt-1">Diário</p><p className="text-xs text-muted-foreground">Frequência Padrão</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><Mail className="h-5 w-5 mx-auto text-green-500" /><p className="text-2xl font-bold mt-1">Ativo</p><p className="text-xs text-muted-foreground">Status</p></CardContent></Card>
      </div>
      {(reports || []).length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground"><p>Nenhum relatório agendado.</p></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {reports?.map((r: unknown) => (
            <Card key={r.id}><CardContent className="p-4 flex items-center justify-between">
              <div><p className="font-medium">{r.report_type}</p><p className="text-sm text-muted-foreground">{r.employee_name || 'Geral'} • {new Date(r.created_at).toLocaleDateString('pt-BR')}</p></div>
              <Badge variant="outline">{r.report_type}</Badge>
            </CardContent></Card>
          ))}
        </div>
      )}
    </div>
  );
}

export { ScheduledReportsPage };
