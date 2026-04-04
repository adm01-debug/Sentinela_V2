import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FileText, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';

export default function CustomReportsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('productivity');
  const [description, setDescription] = useState('');

  const { data: reports, isLoading } = useQuery({
    queryKey: ['custom-reports'],
    queryFn: async () => {
      const { data, error } = await supabase.from('ai_analysis_reports').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createReport = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.functions.invoke('generate-report', { body: { name, type, description } });
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['custom-reports'] }); toast({ title: 'Relatório gerado!' }); setIsOpen(false); },
    onError: (e: Error) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });

  if (isLoading) return <div className="p-6"><Skeleton className="h-96" /></div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Relatórios Personalizados</h1><p className="text-muted-foreground mt-1">Crie e gerencie relatórios customizados</p></div>
        <Button onClick={() => setIsOpen(true)}><Plus className="mr-2 h-4 w-4" />Novo Relatório</Button>
      </div>
      {(reports || []).length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground"><FileText className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>Nenhum relatório encontrado.</p></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {reports?.map((r: unknown) => (
            <Card key={r.id}><CardContent className="p-4 flex items-center justify-between">
              <div><p className="font-medium">{r.report_type}</p><p className="text-sm text-muted-foreground">{r.summary?.slice(0, 100) || 'Sem resumo'}</p></div>
              <div className="flex items-center gap-2"><Badge variant="outline">{r.report_type}</Badge>{r.risk_score != null && <Badge variant={r.risk_score > 70 ? 'destructive' : 'default'}>Score: {r.risk_score}</Badge>}</div>
            </CardContent></Card>
          ))}
        </div>
      )}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo Relatório</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Nome</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
            <div><Label>Tipo</Label><Select value={type} onValueChange={setType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="productivity">Produtividade</SelectItem><SelectItem value="risk">Risco</SelectItem><SelectItem value="behavior">Comportamento</SelectItem><SelectItem value="summary">Resumo</SelectItem></SelectContent></Select></div>
            <div><Label>Descrição</Label><Textarea value={description} onChange={e => setDescription(e.target.value)} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button><Button onClick={() => createReport.mutate()} disabled={createReport.isPending}>{createReport.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Gerar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export { CustomReportsPage };
