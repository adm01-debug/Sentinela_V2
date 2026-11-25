import {
  Webhook,
  Plus,
  ExternalLink,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  Pencil,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PageHeader } from "@/components/layout/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

const EVENT_OPTIONS = [
  { value: "violation.created", label: "Nova violação detectada" },
  { value: "test", label: "Teste manual" },
];

interface WebhookRow {
  id: string;
  name: string;
  url: string;
  events: string[] | null;
  is_active: boolean;
  last_status: string | null;
  last_triggered_at: string | null;
  created_at: string;
}

interface WebhookLogRow {
  id: string;
  event_type: string;
  status: string;
  response_code: number | null;
  error_message: string | null;
  duration_ms: number | null;
  attempt_number: number;
  created_at: string;
}

export default function WebhooksPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [events, setEvents] = useState<string[]>([]);

  const closeDialog = () => {
    setIsOpen(false);
    setEditingId(null);
    setName("");
    setUrl("");
    setEvents([]);
  };

  const openEdit = (wh: WebhookRow) => {
    setEditingId(wh.id);
    setName(wh.name);
    setUrl(wh.url);
    setEvents(wh.events || []);
    setIsOpen(true);
  };

  const { data: webhooks = [], isLoading } = useQuery<WebhookRow[]>({
    queryKey: ["webhooks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("webhooks")
        .select("id, name, url, events, is_active, last_status, last_triggered_at, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as WebhookRow[];
    },
  });

  const {
    data: deliveries = [],
    isLoading: isLoadingDeliveries,
    isError: isDeliveriesError,
    error: deliveriesError,
  } = useQuery<WebhookLogRow[]>({
    queryKey: ["webhook_logs", expandedId],
    enabled: !!expandedId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("webhook_logs")
        .select(
          "id, event_type, status, response_code, error_message, duration_ms, attempt_number, created_at"
        )
        .eq("webhook_id", expandedId as string)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data || []) as WebhookLogRow[];
    },
  });

  const saveWebhook = useMutation({
    mutationFn: async () => {
      const input = { name, url, events };
      const { error } = editingId
        ? await supabase
            .from("webhooks")
            .update({ ...input, updated_at: new Date().toISOString() })
            .eq("id", editingId)
        : await supabase.from("webhooks").insert(input);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
      toast({ title: editingId ? "Webhook atualizado!" : "Webhook criado!" });
      closeDialog();
    },
    onError: (err: Error) =>
      toast({ title: "Erro", description: err.message, variant: "destructive" }),
  });

  const toggleWebhook = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("webhooks")
        .update({ is_active, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["webhooks"] }),
    onError: (err: Error) =>
      toast({ title: "Erro", description: err.message, variant: "destructive" }),
  });

  const deleteWebhook = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("webhooks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
      setDeletingId(null);
      toast({ title: "Webhook excluído!" });
    },
    onError: (err: Error) =>
      toast({ title: "Erro", description: err.message, variant: "destructive" }),
  });

  const testDelivery = useMutation({
    mutationFn: async (wh: WebhookRow) => {
      const subscribed = wh.events || [];
      const eventType = subscribed.includes("test") ? "test" : subscribed[0];
      const { data, error } = await supabase.functions.invoke("send-webhook", {
        body: {
          webhook_id: wh.id,
          event_type: eventType,
          payload: { message: "Entrega de teste", source: "WebhooksPage" },
        },
      });
      if (error) {
        const detail = await (
          error as { context?: { json?: () => Promise<{ error?: string }> } }
        ).context
          ?.json?.()
          .catch(() => null);
        throw new Error(detail?.error || error.message);
      }
      return data as { success?: boolean; status?: number } | null;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
      queryClient.invalidateQueries({ queryKey: ["webhook_logs"] });
      toast({
        title: data?.success ? "Entrega de teste aceita" : "Entrega de teste falhou",
        description: data?.success
          ? "O destino respondeu com sucesso. Veja o resultado em Entregas."
          : `O destino respondeu HTTP ${data?.status ?? "desconhecido"}. Veja o detalhe em Entregas.`,
        variant: data?.success ? "default" : "destructive",
      });
    },
    onError: (err: Error) =>
      toast({
        title: "Erro ao testar webhook",
        description: err.message,
        variant: "destructive",
      }),
  });

  const statusIcon = (status: string | null) => {
    if (!status) return <Clock className="text-muted-foreground h-4 w-4" />;
    if (status === "success") return <CheckCircle className="text-success h-4 w-4" />;
    return <XCircle className="text-destructive h-4 w-4" />;
  };

  if (isLoading)
    return (
      <div className="p-6">
        <Skeleton className="h-96" />
      </div>
    );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Webhooks"
        description="Configure webhooks para notificações automáticas em sistemas externos"
        showBackButton={false}
        actions={
          <Button
            onClick={() => {
              closeDialog();
              setIsOpen(true);
            }}
            className="h-9 gap-2"
          >
            <Plus className="h-4 w-4" />
            Novo Webhook
          </Button>
        }
      />

      {webhooks.length === 0 ? (
        <Card>
          <CardContent className="text-muted-foreground py-12 text-center">
            <Webhook className="mx-auto mb-4 h-12 w-12 opacity-50" />
            <p>Nenhum webhook configurado.</p>
            <p className="mt-1 text-sm">
              Webhooks permitem notificar sistemas externos automaticamente.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {webhooks.map((w) => (
            <Card key={w.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <ExternalLink className="text-muted-foreground h-5 w-5 shrink-0" />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{w.name}</p>
                      <p className="text-muted-foreground truncate text-sm">{w.url}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-1">
                        {(w.events || []).length === 0 ? (
                          <span className="text-destructive text-xs">
                            Nenhum evento assinado — este webhook não recebe nada
                          </span>
                        ) : (
                          (w.events || []).map((ev) => (
                            <Badge key={ev} variant="outline" className="text-xs">
                              {ev}
                            </Badge>
                          ))
                        )}
                      </div>
                      {w.last_triggered_at && (
                        <p className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
                          {statusIcon(w.last_status)}
                          Último disparo{" "}
                          {formatDistanceToNow(new Date(w.last_triggered_at), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant={w.is_active ? "default" : "secondary"}>
                      {w.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                    <Switch
                      checked={w.is_active}
                      onCheckedChange={(checked) =>
                        toggleWebhook.mutate({ id: w.id, is_active: checked })
                      }
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1"
                      disabled={(w.events || []).length === 0 || testDelivery.isPending}
                      onClick={() => testDelivery.mutate(w)}
                    >
                      <Send className="h-3.5 w-3.5" />
                      Testar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1"
                      onClick={() => setExpandedId(expandedId === w.id ? null : w.id)}
                    >
                      {expandedId === w.id ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      Entregas
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEdit(w)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive h-8 w-8"
                      onClick={() => setDeletingId(w.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {expandedId === w.id && (
                  <div className="mt-3 space-y-2 border-t pt-3">
                    {isLoadingDeliveries ? (
                      <Skeleton className="h-16" />
                    ) : isDeliveriesError ? (
                      <p className="text-destructive text-sm">
                        Não foi possível carregar as entregas: {deliveriesError?.message}
                      </p>
                    ) : deliveries.length === 0 ? (
                      <p className="text-muted-foreground text-sm">
                        Nenhuma entrega registrada ainda. Use Testar para gerar a primeira.
                      </p>
                    ) : (
                      deliveries.map((log) => (
                        <div
                          key={log.id}
                          className="flex items-start justify-between gap-3 text-sm"
                        >
                          <div className="min-w-0">
                            <p className="flex items-center gap-2">
                              {statusIcon(log.status)}
                              <span className="font-medium">{log.event_type}</span>
                              {log.response_code != null && (
                                <span className="text-muted-foreground text-xs">
                                  HTTP {log.response_code}
                                </span>
                              )}
                            </p>
                            {log.error_message && (
                              <p className="text-destructive text-xs">{log.error_message}</p>
                            )}
                          </div>
                          <div className="text-muted-foreground shrink-0 text-right text-xs">
                            <p>
                              {formatDistanceToNow(new Date(log.created_at), {
                                addSuffix: true,
                                locale: ptBR,
                              })}
                            </p>
                            <p>
                              {log.duration_ms != null ? `${log.duration_ms}ms` : "—"} · tentativa{" "}
                              {log.attempt_number}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Webhook" : "Novo Webhook"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Meu Webhook"
              />
            </div>
            <div>
              <Label>URL *</Label>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label>Eventos assinados *</Label>
              <p className="text-muted-foreground text-xs">
                O webhook só recebe os eventos marcados aqui.
              </p>
              <div className="mt-2 space-y-2">
                {EVENT_OPTIONS.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={events.includes(opt.value)}
                      onCheckedChange={(checked) =>
                        setEvents(
                          checked === true
                            ? [...events, opt.value]
                            : events.filter((ev) => ev !== opt.value)
                        )
                      }
                    />
                    <span>
                      {opt.label}{" "}
                      <span className="text-muted-foreground text-xs">({opt.value})</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancelar
            </Button>
            <Button
              onClick={() => saveWebhook.mutate()}
              disabled={!url || !name || events.length === 0 || saveWebhook.isPending}
            >
              {saveWebhook.isPending ? "Salvando..." : editingId ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deletingId}
        onOpenChange={(open) => {
          if (!open) setDeletingId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir webhook?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação é irreversível. O webhook e seus logs serão excluídos permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deletingId && deleteWebhook.mutate(deletingId)}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export { WebhooksPage };
