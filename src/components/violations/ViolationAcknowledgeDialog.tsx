import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FileSignature, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

export interface ViolationAcknowledgeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  violationId: string;
  employeeName?: string | null;
  acknowledgedAt?: string | null;
  onAcknowledged: () => Promise<void> | void;
}

/**
 * Registro da ciência do funcionário sobre uma violação.
 *
 * Os campos probatórios (`employee_acknowledged_at`, `_reason`, `_signature`,
 * `_ip`, `_device`) só podem ser gravados pela edge `acknowledge-violation`,
 * porque ela tem o IP real da requisição e gera o hash de assinatura. Até
 * então a edge só aceitava `x-agent-key`, então o painel nunca alimentava o
 * relatório de ciência (`employee_ack_*` ficava sempre nulo).
 */
export function ViolationAcknowledgeDialog({
  open,
  onOpenChange,
  violationId,
  employeeName,
  acknowledgedAt,
  onAcknowledged,
}: ViolationAcknowledgeDialogProps) {
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  const jaReconhecida = Boolean(acknowledgedAt);

  const handleSubmit = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke("acknowledge-violation", {
        body: {
          violation_id: violationId,
          action: "acknowledged",
          reason: reason.trim() || undefined,
          device: "painel-web",
        },
      });

      if (error) throw error;
      const resposta = data as { error?: string } | null;
      if (resposta?.error) throw new Error(resposta.error);

      await onAcknowledged();
      toast.success("Ciência do funcionário registrada");
      setReason("");
      onOpenChange(false);
    } catch (erro) {
      const mensagem = erro instanceof Error ? erro.message : "Falha ao registrar a ciência";
      toast.error(mensagem);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSignature className="h-4 w-4" />
            Registrar ciência da violação
          </DialogTitle>
          <DialogDescription>
            {employeeName
              ? `Confirma que ${employeeName} foi informado e teve ciência desta violação.`
              : "Confirma que o funcionário foi informado e teve ciência desta violação."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {jaReconhecida ? (
            <div className="rounded-md border p-3 text-sm">
              Ciência já registrada em{" "}
              {format(new Date(acknowledgedAt as string), "dd/MM/yyyy 'às' HH:mm", {
                locale: ptBR,
              })}
              .
            </div>
          ) : (
            <>
              <div className="text-muted-foreground space-y-1 text-xs">
                <p>O registro guarda data/hora, assinatura (hash), IP e origem da requisição.</p>
                <p>Esses dados alimentam o relatório de ciência por funcionário.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ack-reason">Observação (opcional)</Label>
                <Textarea
                  id="ack-reason"
                  value={reason}
                  onChange={(evento) => setReason(evento.target.value)}
                  placeholder="Ex.: ciência registrada em reunião presencial com o RH"
                  maxLength={2000}
                  rows={3}
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            {jaReconhecida ? "Fechar" : "Cancelar"}
          </Button>
          {!jaReconhecida && (
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Confirmar ciência
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ViolationAcknowledgeDialog;
