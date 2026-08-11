import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/Skeleton';
import { AlertTriangle, Image as ImageIcon, MapPin, Monitor, Shield, ShieldCheck, Clock, BellOff, Gavel } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ViolationDisputeDialog } from './ViolationDisputeDialog';
import { DISPUTE_STATUS_LABEL, type DisputeStatus } from '@/hooks/useViolationDisputes';

interface Props {
  violationId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ViolationDetail {
  id: string;
  employee_name: string | null;
  policy_name: string | null;
  violation_type: string | null;
  severity: string | null;
  description: string | null;
  device: string | null;
  ip_address: string | null;
  created_at: string;
  screenshot_url: string | null;
  location: string | null;
  status: string | null;
  resolution_notes: string | null;
  employee_notified_at: string | null;
  employee_acknowledged_at: string | null;
  employee_ack_reason: string | null;
  employee_ack_signature: string | null;
  employee_ack_device: string | null;
  employee_ack_ip: string | null;
  company_id: string | null;
  dispute_status: DisputeStatus | null;
}

const severityTone: Record<string, string> = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-warning/15 text-warning',
  high: 'bg-destructive/15 text-destructive',
  critical: 'bg-destructive text-destructive-foreground',
};

/**
 * Modal detalhado de uma violação de segurança, com screenshot associado (quando disponível).
 */
export function ViolationDetailDialog({ violationId, open, onOpenChange }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['violation-detail', violationId],
    enabled: !!violationId && open,
    staleTime: 60_000,
    queryFn: async (): Promise<ViolationDetail | null> => {
      if (!violationId) return null;
      const { data, error } = await supabase
        .from('security_violations')
        .select(
          'id, employee_name, policy_name, violation_type, severity, description, device, ip_address, created_at, screenshot_url, location, status, resolution_notes, employee_notified_at, employee_acknowledged_at, employee_ack_reason, employee_ack_signature, employee_ack_device, employee_ack_ip, company_id, dispute_status',
        )
        .eq('id', violationId)
        .maybeSingle();
      if (error) throw error;
      return data as ViolationDetail | null;
    },
  });
  const [disputeOpen, setDisputeOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Detalhes da Violação
          </DialogTitle>
          <DialogDescription>
            Evidência completa do incidente, incluindo screenshot capturado no momento.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : !data ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Violação não encontrada.</div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={severityTone[data.severity ?? 'medium'] ?? severityTone.medium}>
                {data.severity ?? 'medium'}
              </Badge>
              {data.status && <Badge variant="outline">{data.status}</Badge>}
              {data.violation_type && (
                <Badge variant="secondary" className="gap-1">
                  <Shield className="h-3 w-3" /> {data.violation_type}
                </Badge>
              )}
              <span className="ml-auto text-xs text-muted-foreground">
                {format(new Date(data.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </span>
            </div>

            {data.policy_name && (
              <div>
                <div className="text-xs text-muted-foreground">Política violada</div>
                <div className="text-sm font-medium text-foreground">{data.policy_name}</div>
              </div>
            )}

            {data.description && (
              <div>
                <div className="text-xs text-muted-foreground">Descrição</div>
                <p className="text-sm text-foreground whitespace-pre-wrap">{data.description}</p>
              </div>
            )}

            <div className="rounded-lg border bg-muted/40 overflow-hidden">
              {data.screenshot_url ? (
                <a
                  href={data.screenshot_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <img
                    src={data.screenshot_url}
                    alt={`Screenshot da violação ${data.violation_type ?? ''}`}
                    className="w-full max-h-[420px] object-contain bg-muted"
                    loading="lazy"
                  />
                </a>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
                  <ImageIcon className="h-8 w-8" />
                  <span className="text-sm">Nenhum screenshot associado a esta violação.</span>
                </div>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              {data.employee_name && (
                <div>
                  <div className="text-xs text-muted-foreground">Colaborador</div>
                  <div className="font-medium text-foreground">{data.employee_name}</div>
                </div>
              )}
              {data.device && (
                <div className="flex items-start gap-2">
                  <Monitor className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">Dispositivo</div>
                    <div className="font-medium text-foreground">{data.device}</div>
                  </div>
                </div>
              )}
              {data.ip_address && (
                <div>
                  <div className="text-xs text-muted-foreground">Endereço IP</div>
                  <div className="font-mono text-xs text-foreground">{data.ip_address}</div>
                </div>
              )}
              {data.location && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">Localização</div>
                    <div className="font-medium text-foreground">{data.location}</div>
                  </div>
                </div>
              )}
            </div>

            {data.resolution_notes && (
              <div className="rounded-md border border-success/30 bg-success/5 p-3">
                <div className="text-xs font-medium text-success">Notas de resolução</div>
                <p className="mt-1 text-sm text-foreground whitespace-pre-wrap">{data.resolution_notes}</p>
              </div>
            )}

            <div className="rounded-md border p-3 space-y-2">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Ciência do Colaborador (LGPD)
              </div>
              {data.employee_acknowledged_at ? (
                <div className="space-y-1">
                  <Badge className="bg-success/15 text-success gap-1">
                    <ShieldCheck className="h-3 w-3" /> Ciente
                  </Badge>
                  <div className="text-xs text-muted-foreground">
                    Confirmado em{' '}
                    {format(new Date(data.employee_acknowledged_at), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })}
                    {data.employee_ack_device ? ` · ${data.employee_ack_device}` : ''}
                    {data.employee_ack_ip ? ` · IP ${data.employee_ack_ip}` : ''}
                  </div>
                  {data.employee_ack_reason && (
                    <div className="text-xs text-foreground">
                      <span className="text-muted-foreground">Justificativa: </span>
                      {data.employee_ack_reason}
                    </div>
                  )}
                  {data.employee_ack_signature && (
                    <div className="text-[10px] font-mono text-muted-foreground break-all">
                      SHA-256: {data.employee_ack_signature}
                    </div>
                  )}
                </div>
              ) : data.employee_notified_at ? (
                <div>
                  <Badge className="bg-warning/15 text-warning gap-1">
                    <Clock className="h-3 w-3" /> Notificado, aguardando ciência
                  </Badge>
                  <div className="text-xs text-muted-foreground mt-1">
                    Aviso exibido em{' '}
                    {format(new Date(data.employee_notified_at), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })}
                  </div>
                </div>
              ) : (
                <Badge variant="outline" className="gap-1">
                  <BellOff className="h-3 w-3" /> Não notificado (agente offline)
                </Badge>
              )}
            </div>

            <div className="rounded-md border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Contestação (LGPD)
                </div>
                {data.dispute_status && (
                  <Badge variant="outline" className="text-xs">
                    {DISPUTE_STATUS_LABEL[data.dispute_status]}
                  </Badge>
                )}
              </div>
              <Button
                size="sm"
                variant={data.dispute_status ? 'outline' : 'default'}
                className="gap-1.5 w-full"
                onClick={() => setDisputeOpen(true)}
                disabled={!data.company_id}
              >
                <Gavel className="h-4 w-4" />
                {data.dispute_status ? 'Ver contestação' : 'Contestar violação'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
      {data?.company_id && (
        <ViolationDisputeDialog
          open={disputeOpen}
          onOpenChange={setDisputeOpen}
          violationId={data.id}
          companyId={data.company_id}
          employeeName={data.employee_name ?? '—'}
        />
      )}
    </Dialog>
  );
}
