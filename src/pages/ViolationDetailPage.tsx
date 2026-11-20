import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowLeft,
  AlertTriangle,
  Monitor,
  MapPin,
  Shield,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/Skeleton";
import { PageHeader } from "@/components/layout/PageHeader";
import { useViolation, useUpdateViolationStatus } from "@/hooks/useSecurityViolations";
import { ViolationCommentsPanel } from "@/components/ViolationCommentsPanel";
import { ViolationTimelineDialog } from "@/components/violations/ViolationTimelineDialog";
import { ViolationDisputeDialog } from "@/components/violations/ViolationDisputeDialog";
import { DISPUTE_STATUS_LABEL, type DisputeStatus } from "@/hooks/useViolationDisputes";

const severityTone: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-warning/15 text-warning",
  high: "bg-destructive/15 text-destructive",
  critical: "bg-destructive text-destructive-foreground",
};

export default function ViolationDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useViolation(id);
  const updateStatus = useUpdateViolationStatus();
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [acknowledging, setAcknowledging] = useState(false);

  const violation = data as
    | (typeof data & {
        dispute_status?: DisputeStatus | null;
        company_id?: string | null;
      })
    | null;

  const handleResolve = async () => {
    if (!id || resolving) return;
    setResolving(true);
    try {
      await updateStatus.mutateAsync({ id, status: "resolved" });
    } finally {
      setResolving(false);
    }
  };

  const handleAcknowledge = async () => {
    if (!id || acknowledging) return;
    setAcknowledging(true);
    try {
      await updateStatus.mutateAsync({ id, status: "acknowledged" });
    } finally {
      setAcknowledging(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>

      <PageHeader
        title="Detalhes da Violação"
        description="Evidência completa do incidente, incluindo screenshot capturado no momento."
      />

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : isError || !violation ? (
        <Card>
          <CardContent className="text-muted-foreground py-8 text-center text-sm">
            Violação não encontrada.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <AlertTriangle className="text-destructive h-5 w-5" />
                  <CardTitle className="text-lg">Detalhes da Violação</CardTitle>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    className={severityTone[violation.severity ?? "medium"] ?? severityTone.medium}
                  >
                    {violation.severity ?? "medium"}
                  </Badge>
                  {violation.status && <Badge variant="outline">{violation.status}</Badge>}
                  {violation.violation_type && (
                    <Badge variant="secondary" className="gap-1">
                      <Shield className="h-3 w-3" /> {violation.violation_type}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-muted-foreground text-xs">
                  Criada em{" "}
                  {violation.created_at
                    ? format(new Date(violation.created_at), "dd/MM/yyyy 'às' HH:mm", {
                        locale: ptBR,
                      })
                    : "—"}
                </div>

                {violation.policy_name && (
                  <div>
                    <div className="text-muted-foreground text-xs">Política violada</div>
                    <div className="text-foreground text-sm font-medium">
                      {violation.policy_name}
                    </div>
                  </div>
                )}

                {violation.description && (
                  <div>
                    <div className="text-muted-foreground text-xs">Descrição</div>
                    <p className="text-foreground text-sm whitespace-pre-wrap">
                      {violation.description}
                    </p>
                  </div>
                )}

                <div className="bg-muted/40 overflow-hidden rounded-lg border">
                  {violation.screenshot_url ? (
                    <a href={violation.screenshot_url} target="_blank" rel="noopener noreferrer">
                      <img
                        src={violation.screenshot_url}
                        alt={`Screenshot da violação ${violation.violation_type ?? ""}`}
                        className="bg-muted max-h-[420px] w-full object-contain"
                        loading="lazy"
                      />
                    </a>
                  ) : (
                    <div className="text-muted-foreground py-10 text-center text-sm">
                      Nenhum screenshot associado a esta violação.
                    </div>
                  )}
                </div>

                <div className="grid gap-3 text-sm sm:grid-cols-2">
                  {violation.employee_name && (
                    <div>
                      <div className="text-muted-foreground text-xs">Colaborador</div>
                      <div className="text-foreground font-medium">{violation.employee_name}</div>
                    </div>
                  )}
                  {violation.device && (
                    <div className="flex items-start gap-2">
                      <Monitor className="text-muted-foreground mt-0.5 h-4 w-4" />
                      <div>
                        <div className="text-muted-foreground text-xs">Dispositivo</div>
                        <div className="text-foreground font-medium">{violation.device}</div>
                      </div>
                    </div>
                  )}
                  {violation.ip_address && (
                    <div>
                      <div className="text-muted-foreground text-xs">Endereço IP</div>
                      <div className="text-foreground font-mono text-xs">
                        {violation.ip_address}
                      </div>
                    </div>
                  )}
                  {violation.location && (
                    <div className="flex items-start gap-2">
                      <MapPin className="text-muted-foreground mt-0.5 h-4 w-4" />
                      <div>
                        <div className="text-muted-foreground text-xs">Localização</div>
                        <div className="text-foreground font-medium">{violation.location}</div>
                      </div>
                    </div>
                  )}
                </div>

                {violation.resolved_at && (
                  <div className="border-success/30 bg-success/5 rounded-md border p-3">
                    <div className="text-success text-xs font-medium">
                      <CheckCircle2 className="mr-1 inline h-3 w-3" />
                      Resolvida em{" "}
                      {format(new Date(violation.resolved_at), "dd/MM/yyyy 'às' HH:mm", {
                        locale: ptBR,
                      })}
                    </div>
                  </div>
                )}

                {violation.dispute_status && (
                  <div className="rounded-md border p-3">
                    <div className="text-muted-foreground text-xs font-medium">Contestação</div>
                    <Badge variant="outline">
                      {DISPUTE_STATUS_LABEL[violation.dispute_status]}
                    </Badge>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-2">
                  {(violation.status === "open" || violation.status === "investigating") && (
                    <Button onClick={handleAcknowledge} disabled={acknowledging}>
                      {acknowledging ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Reconhecer violação
                    </Button>
                  )}
                  {violation.status !== "resolved" && (
                    <Button variant="outline" onClick={handleResolve} disabled={resolving}>
                      {resolving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Resolver violação
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => setTimelineOpen(true)}>
                    Ver timeline detalhada
                  </Button>
                  <Button
                    variant={violation.dispute_status ? "outline" : "default"}
                    onClick={() => setDisputeOpen(true)}
                  >
                    {violation.dispute_status ? "Ver contestação" : "Contestar violação"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Comentários</CardTitle>
              </CardHeader>
              <CardContent>
                <ViolationCommentsPanel
                  violationId={violation.id}
                  currentStatus={violation.status ?? "open"}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <ViolationTimelineDialog
        violationId={id ?? null}
        open={timelineOpen}
        onOpenChange={setTimelineOpen}
      />
      <ViolationDisputeDialog
        open={disputeOpen}
        onOpenChange={setDisputeOpen}
        violationId={violation?.id ?? ""}
        companyId={violation?.company_id ?? ""}
        employeeName={violation?.employee_name ?? "—"}
      />
    </div>
  );
}

export { ViolationDetailPage };
