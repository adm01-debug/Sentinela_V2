/**
 * Portal público de verificação de integridade dos relatórios PDF.
 * O usuário informa o ID do relatório (SNL-...) e valida o SHA-256 registrado.
 */
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, ShieldAlert, ShieldCheck, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SignatureRow {
  report_id: string;
  report_type: string;
  signature: string;
  event_count: number;
  period_label: string | null;
  created_at: string;
}

type Status = 'idle' | 'loading' | 'valid' | 'invalid' | 'not_found';

export default function VerifyReportPage() {
  const [searchParams] = useSearchParams();
  const [reportId, setReportId] = useState('');
  const [expected, setExpected] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [row, setRow] = useState<SignatureRow | null>(null);

  const runVerify = useCallback(async (id: string, sig: string) => {
    if (!id) return;
    setStatus('loading'); setRow(null);
    const { data, error } = await supabase
      .from('report_signatures')
      .select('report_id, report_type, signature, event_count, period_label, created_at')
      .eq('report_id', id)
      .maybeSingle();
    if (error || !data) { setStatus('not_found'); return; }
    setRow(data);
    if (sig.trim()) {
      setStatus(data.signature.toLowerCase() === sig.trim().toLowerCase() ? 'valid' : 'invalid');
    } else {
      setStatus('valid');
    }
  }, []);

  const handleVerify = () => runVerify(reportId.trim(), expected);

  useEffect(() => {
    const id = searchParams.get('id');
    const sig = searchParams.get('sig');
    if (id) {
      setReportId(id);
      if (sig) setExpected(sig);
      void runVerify(id, sig ?? '');
    }
  }, [searchParams, runVerify]);



  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div className="space-y-2 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <ShieldCheck className="h-6 w-6 text-primary" aria-hidden />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Verificar integridade de relatório</h1>
        <p className="text-sm text-muted-foreground">
          Informe o ID do relatório impresso no rodapé do PDF. Opcionalmente, cole a assinatura SHA-256 completa da última página para verificação estrita.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados do relatório</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="reportId">ID do relatório</Label>
            <Input
              id="reportId"
              placeholder="SNL-20260122140530-A1B2C3"
              value={reportId}
              onChange={(e) => setReportId(e.target.value)}
              autoComplete="off"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="signature">Assinatura SHA-256 (opcional)</Label>
            <Input
              id="signature"
              placeholder="Cole aqui os 64 caracteres da assinatura"
              value={expected}
              onChange={(e) => setExpected(e.target.value)}
              className="font-mono text-xs"
              autoComplete="off"
            />
          </div>
          <Button onClick={handleVerify} disabled={status === 'loading' || !reportId.trim()} className="w-full">
            {status === 'loading' ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verificando…</>
            ) : 'Verificar'}
          </Button>
        </CardContent>
      </Card>

      {status === 'not_found' && (
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Relatório não encontrado</AlertTitle>
          <AlertDescription>
            Nenhum registro corresponde a este ID. Confirme se o valor foi copiado corretamente do rodapé do PDF.
          </AlertDescription>
        </Alert>
      )}

      {status === 'invalid' && row && (
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Assinatura NÃO corresponde</AlertTitle>
          <AlertDescription>
            O relatório existe, mas a assinatura fornecida diverge da registrada — o documento pode ter sido alterado.
          </AlertDescription>
        </Alert>
      )}

      {status === 'valid' && row && (
        <Card className="relative overflow-hidden border-success/40 bg-success/5">
          {/* Watermark diagonal "VERIFICADO" */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.08]"
          >
            <span className="rotate-[-24deg] select-none whitespace-nowrap text-[6rem] font-black tracking-widest text-success">
              VERIFICADO
            </span>
          </div>
          {/* Selo circular no canto */}
          <div className="pointer-events-none absolute right-4 top-4 flex h-20 w-20 rotate-[-12deg] items-center justify-center rounded-full border-4 border-success/70 text-center text-[10px] font-black uppercase leading-tight tracking-wider text-success/80">
            Sentinela<br />Autêntico<br />
            <span className="text-[8px] font-bold">
              {format(new Date(row.created_at), 'dd/MM/yy')}
            </span>
          </div>

          <CardHeader className="relative flex-row items-center gap-3 space-y-0">
            <CheckCircle2 className="h-6 w-6 text-success" aria-hidden />
            <div>
              <CardTitle className="text-base text-success">Relatório autêntico</CardTitle>
              <p className="text-xs text-muted-foreground">Registro localizado no backend.</p>
            </div>
          </CardHeader>
          <CardContent className="relative space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">ID:</span><span className="font-mono">{row.report_id}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tipo:</span><span>{row.report_type}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Eventos:</span><span>{row.event_count}</span></div>
            {row.period_label && (
              <div className="flex justify-between"><span className="text-muted-foreground">Período:</span><span>{row.period_label}</span></div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gerado em:</span>
              <span>{format(new Date(row.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}</span>
            </div>
            <div className="pt-2">
              <div className="text-xs text-muted-foreground mb-1">SHA-256 registrado:</div>
              <div className="font-mono text-[10px] break-all rounded bg-muted p-2">{row.signature}</div>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
