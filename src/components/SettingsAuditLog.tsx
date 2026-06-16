import React, { useState } from "react";
import {
  History,
  ChevronDown,
  ChevronUp,
  User,
  Clock,
  Pencil,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useAuditLog, type AuditLogEntry } from "@/hooks/useAuditLog";

const actionConfig: Record<
  string,
  { icon: React.ComponentType<{ className?: string }>; color: string; label: string }
> = {
  CRIAR: { icon: Plus, color: "text-success", label: "Criou" },
  EDITAR: { icon: Pencil, color: "text-primary", label: "Editou" },
  EXCLUIR: { icon: Trash2, color: "text-destructive", label: "Excluiu" },
  ATIVAR: { icon: ToggleRight, color: "text-success", label: "Ativou" },
  DESATIVAR: { icon: ToggleLeft, color: "text-warning", label: "Desativou" },
  ALTERAR_STATUS: { icon: Pencil, color: "text-primary", label: "Alterou status" },
};

const entityTypeLabels: Record<string, string> = {
  policy: "Política",
  app_rule: "Aplicativo",
};

function AuditLogItem({ entry }: { entry: AuditLogEntry }) {
  const [expanded, setExpanded] = useState(false);
  const config = actionConfig[entry.action] || {
    icon: Pencil,
    color: "text-muted-foreground",
    label: entry.action,
  };
  const Icon = config.icon;

  return (
    <Collapsible open={expanded} onOpenChange={setExpanded}>
      <div className="border-b border-border py-3 last:border-b-0">
        <CollapsibleTrigger asChild>
          <button className="-m-2 flex w-full items-start gap-3 rounded-lg p-2 text-left transition-colors hover:bg-accent/50">
            <div className={cn("shrink-0 rounded-lg bg-accent p-2", config.color)}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn("font-medium", config.color)}>{config.label}</span>
                <Badge variant="outline" className="text-xs">
                  {entityTypeLabels[entry.entity_type] || entry.entity_type}
                </Badge>
                <span className="truncate font-medium">{entry.entity_name}</span>
              </div>
              <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {entry.user_email}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(entry.created_at), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </span>
              </div>
            </div>
            {((entry.old_value as string | null) || (entry.new_value as string | null)) && (
              <div className="shrink-0">
                {expanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            )}
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="ml-11 mt-3 space-y-2 text-sm">
            {(entry.old_value as string | null) && (
              <div className="rounded border border-destructive/20 bg-destructive/10 p-2">
                <p className="mb-1 text-xs font-medium text-destructive">Valor anterior:</p>
                <pre className="overflow-x-auto text-xs">
                  {JSON.stringify(entry.old_value, null, 2)}
                </pre>
              </div>
            )}
            {(entry.new_value as string | null) && (
              <div className="rounded border border-success/20 bg-success/10 p-2">
                <p className="mb-1 text-xs font-medium text-success">Novo valor:</p>
                <pre className="overflow-x-auto text-xs">
                  {JSON.stringify(entry.new_value, null, 2)}
                </pre>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {format(new Date(entry.created_at), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })}
            </p>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

export function SettingsAuditLog() {
  const { logs, loading, refetch } = useAuditLog();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-card">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button className="flex w-full items-center justify-between rounded-t-xl p-4 transition-colors hover:bg-accent/50">
            <div className="flex items-center gap-3">
              <History className="h-5 w-5 text-primary" />
              <div className="text-left">
                <h3 className="font-semibold">Histórico de Alterações</h3>
                <p className="text-sm text-muted-foreground">
                  {logs.length}{" "}
                  {logs.length === 1 ? "alteração registrada" : "alterações registradas"}
                </p>
              </div>
            </div>
            {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border-t border-border">
            <div className="flex justify-end border-b border-border p-4">
              <Button variant="outline" size="sm" onClick={refetch} disabled={loading}>
                Atualizar
              </Button>
            </div>

            <ScrollArea className="h-[400px]">
              <div className="p-4">
                {loading ? (
                  <p className="py-8 text-center text-muted-foreground">Carregando...</p>
                ) : logs.length === 0 ? (
                  <div className="py-8 text-center">
                    <History className="mx-auto mb-2 h-12 w-12 text-muted-foreground/30" />
                    <p className="text-muted-foreground">Nenhuma alteração registrada</p>
                  </div>
                ) : (
                  logs.map((entry) => <AuditLogItem key={entry.id} entry={entry} />)
                )}
              </div>
            </ScrollArea>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
