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
import { Skeleton } from '@/components/Skeleton';
import { AlertTriangle, Image as ImageIcon, MapPin, Monitor, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
          'id, employee_name, policy_name, violation_type, severity, description, device, ip_address, created_at, screenshot_url, location, status, resolution_notes',
        )
        .eq('id', violationId)
        .maybeSingle();
      if (error) throw error;
      return data as ViolationDetail | null;
    },
  });

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
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
