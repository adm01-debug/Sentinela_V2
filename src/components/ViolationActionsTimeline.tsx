import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { History, Loader2, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/Skeleton";
import { useUpdateViolationStatus, type SecurityViolation } from "@/hooks/useSecurityViolations";
import {
  ACTION_STATUS,
  VIOLATION_ACTION_META,
  describeTransition,
  labelForAction,
  useRecordViolationAction,
  useViolationActions,
  type ViolationActionType,
} from "@/hooks/useViolationActions";

const MANUAL_ACTIONS: ViolationActionType[] = [
  "warn",
  "investigate",
  "escalate",
  "dismiss",
  "resolve",
  "reopen",
];

interface ViolationActionsTimelineProps {
  violationId: string;
  currentStatus: string;
}

export function ViolationActionsTimeline({
  violationId,
  currentStatus,
}: ViolationActionsTimelineProps) {
  const { data: actions, isLoading, isError } = useViolationActions(violationId);
  const recordAction = useRecordViolationAction();
  const updateStatus = useUpdateViolationStatus();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<ViolationActionType>("warn");
  const [notes, setNotes] = useState("");

  const notesTooShort = notes.trim().length < 3;
  const saving = recordAction.isPending || updateStatus.isPending;

  async function handleSubmit() {
    if (notesTooShort) return;

    const nextStatus = ACTION_STATUS[actionType];

    if (nextStatus) {
      // Mudanca de status passa pelo caminho auditado (useUpdateViolationStatus).
      await updateStatus.mutateAsync({
        id: violationId,
        status: nextStatus as SecurityViolation["status"],
        notes,
      });
    } else {
      await recordAction.mutateAsync({
        violationId,
        actionType,
        notes,
        previousStatus: currentStatus,
        newStatus: currentStatus,
      });
    }

    setDialogOpen(false);
    setNotes("");
    setActionType("warn");
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="h-4 w-4" />
          Histórico de ações
        </CardTitle>
        <Button size="sm" variant="outline" onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Registrar ação
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        )}

        {isError && (
          <p className="text-destructive text-sm">
            Não foi possível carregar o histórico desta violação.
          </p>
        )}

        {!isLoading && !isError && (actions?.length ?? 0) === 0 && (
          <p className="text-muted-foreground text-sm">
            Nenhuma ação registrada. Reconhecer ou resolver a violação cria o histórico
            automaticamente.
          </p>
        )}

        <ol className="space-y-3">
          {(actions ?? []).map((action) => {
            const transition = describeTransition(action.previous_status, action.new_status);
            return (
              <li key={action.id} className="border-muted flex gap-3 border-l-2 pl-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">
                      {labelForAction(action.action_type)}
                    </span>
                    {transition && (
                      <Badge variant="outline" className="text-xs">
                        {transition}
                      </Badge>
                    )}
                    <span className="text-muted-foreground text-xs">
                      {action.author_name || "Usuário removido"} -{" "}
                      {format(new Date(action.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                  {action.notes && (
                    <p className="text-muted-foreground mt-1 text-sm">{action.notes}</p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar ação na violação</DialogTitle>
            <DialogDescription>
              A ação fica gravada no histórico com autor, data e justificativa.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Ação</Label>
              <Select
                value={actionType}
                onValueChange={(value) => setActionType(value as ViolationActionType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MANUAL_ACTIONS.map((action) => (
                    <SelectItem key={action} value={action}>
                      {VIOLATION_ACTION_META[action].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-muted-foreground text-xs">
                {VIOLATION_ACTION_META[actionType].description}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="action-notes">Justificativa</Label>
              <Textarea
                id="action-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Descreva o que foi feito e por que"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={saving || notesTooShort}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Registrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
