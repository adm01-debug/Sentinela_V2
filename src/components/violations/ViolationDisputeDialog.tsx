import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Gavel,
  ShieldQuestion,
  CheckCircle2,
  XCircle,
  Clock,
  Scale,
  Undo2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  DISPUTE_CATEGORY_LABEL,
  DISPUTE_STATUS_LABEL,
  useCreateDispute,
  useResolveDispute,
  useViolationDisputes,
  type DisputeCategory,
  type DisputeStatus,
} from '@/hooks/useViolationDisputes';
import { useAuth } from '@/hooks/useAuth';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  violationId: string;
  companyId: string;
  employeeName: string;
}

const STATUS_ICON: Record<DisputeStatus, React.ReactNode> = {
  pending: <Clock className="h-3 w-3" />,
  under_review: <Scale className="h-3 w-3" />,
  approved: <CheckCircle2 className="h-3 w-3" />,
  rejected: <XCircle className="h-3 w-3" />,
  withdrawn: <Undo2 className="h-3 w-3" />,
};

const STATUS_CLASS: Record<DisputeStatus, string> = {
  pending: 'bg-warning/15 text-warning',
  under_review: 'bg-primary/15 text-primary',
  approved: 'bg-success/15 text-success',
  rejected: 'bg-destructive/15 text-destructive',
  withdrawn: 'bg-muted text-muted-foreground',
};

export function ViolationDisputeDialog({
  open,
  onOpenChange,
  violationId,
  companyId,
  employeeName,
}: Props) {
  const { data: disputes = [], isLoading } = useViolationDisputes(open ? violationId : null);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.isAdmin === true;
  const create = useCreateDispute();
  const resolve = useResolveDispute();

  const [category, setCategory] = useState<DisputeCategory>('false_positive');
  const [reason, setReason] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');

  const openDispute = disputes.find((d) => d.status === 'pending' || d.status === 'under_review');

  const handleSubmit = async () => {
    if (reason.trim().length < 10) {
      toast.error('Descreva a contestação com pelo menos 10 caracteres.');
      return;
    }
    try {
      await create.mutateAsync({
        violationId,
        companyId,
        employeeName,
        category,
        reason: reason.trim(),
      });
      toast.success('Contestação registrada. Você será notificado ao ser julgada.');
      setReason('');
    } catch (e) {
      const err = e as Error;
      toast.error(err.message);
    }
  };

  const handleResolve = async (status: Exclude<DisputeStatus, 'pending'>) => {
    if (!openDispute) return;
    try {
      await resolve.mutateAsync({
        disputeId: openDispute.id,
        violationId,
        status,
        notes: resolutionNotes.trim() || undefined,
      });
      toast.success(`Contestação ${DISPUTE_STATUS_LABEL[status].toLowerCase()}.`);
      setResolutionNotes('');
    } catch (e) {
      const err = e as Error;
      toast.error(err.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gavel className="h-5 w-5 text-primary" />
            Contestação da violação
          </DialogTitle>
          <DialogDescription>
            Fluxo formal LGPD com assinatura SHA-256 e trilha auditável.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : (
          <div className="space-y-4">
            {disputes.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Histórico</h4>
                {disputes.map((d) => (
                  <div key={d.id} className="rounded-md border p-3 space-y-1.5 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <Badge className={`gap-1 ${STATUS_CLASS[d.status]}`}>
                        {STATUS_ICON[d.status]} {DISPUTE_STATUS_LABEL[d.status]}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(d.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Categoria: <strong>{DISPUTE_CATEGORY_LABEL[d.category]}</strong>
                    </div>
                    <p className="text-foreground whitespace-pre-wrap">{d.reason}</p>
                    {d.resolution_notes && (
                      <div className="mt-2 rounded bg-muted/50 p-2 text-xs">
                        <strong>Decisão:</strong> {d.resolution_notes}
                      </div>
                    )}
                    {d.signature_sha256 && (
                      <div className="text-[10px] font-mono text-muted-foreground break-all">
                        SHA-256: {d.signature_sha256}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {!openDispute && (
              <div className="space-y-3 border-t pt-4">
                <h4 className="text-sm font-semibold flex items-center gap-1.5">
                  <ShieldQuestion className="h-4 w-4" /> Nova contestação
                </h4>
                <div className="space-y-1.5">
                  <Label htmlFor="cat">Motivo</Label>
                  <Select
                    value={category}
                    onValueChange={(v) => setCategory(v as DisputeCategory)}
                  >
                    <SelectTrigger id="cat">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(DISPUTE_CATEGORY_LABEL) as DisputeCategory[]).map((k) => (
                        <SelectItem key={k} value={k}>
                          {DISPUTE_CATEGORY_LABEL[k]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reason">Descrição detalhada</Label>
                  <Textarea
                    id="reason"
                    rows={4}
                    placeholder="Explique o contexto, evidências e por que a violação não procede…"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    {reason.length}/1000 · Mínimo 10 caracteres
                  </p>
                </div>
              </div>
            )}

            {openDispute && isAdmin && (
              <div className="space-y-3 border-t pt-4">
                <h4 className="text-sm font-semibold flex items-center gap-1.5">
                  <Scale className="h-4 w-4" /> Julgamento (admin)
                </h4>
                <Textarea
                  rows={3}
                  placeholder="Notas de resolução (opcional, ficam registradas na trilha)…"
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleResolve('under_review')}
                    disabled={resolve.isPending}
                  >
                    Marcar em análise
                  </Button>
                  <Button
                    size="sm"
                    className="bg-success text-success-foreground hover:bg-success/90"
                    onClick={() => handleResolve('approved')}
                    disabled={resolve.isPending}
                  >
                    Aprovar contestação
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleResolve('rejected')}
                    disabled={resolve.isPending}
                  >
                    Rejeitar
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          {!openDispute && (
            <Button onClick={handleSubmit} disabled={create.isPending || reason.trim().length < 10}>
              {create.isPending ? 'Enviando…' : 'Registrar contestação'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
