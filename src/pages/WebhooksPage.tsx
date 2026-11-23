import { Webhook, Plus, ExternalLink, Trash2, CheckCircle, XCircle, Clock } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";

interface WebhookRow {
  id: string;
  name: string;
  url: string;
  is_active: boolean;
  last_status: string | null;
  last_triggered_at: string | null;
  created_at: string;
}

export default function WebhooksPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");

  const { data: webhooks = [], isLoading } = useQuery<WebhookRow[]>({
    queryKey: ["webhooks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("webhooks")
        .select("id, name, url, is_active, last_status, last_triggered_at, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as WebhookRow[];
    },
  });

  const createWebhook = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("webhooks").insert({ name, url });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
      setIsOpen(false);
      setName("");
      setUrl("");
      toast({ title: "Webhook criado!" });
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
          <Button onClick={() => setIsOpen(true)} className="h-9 gap-2">
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
              <CardContent className="flex items-center justify-between gap-4 p-4">
                <div className="flex min-w-0 items-center gap-3">
                  <ExternalLink className="text-muted-foreground h-5 w-5 shrink-0" />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{w.name}</p>
                    <p className="text-muted-foreground truncate text-sm">{w.url}</p>
                    {w.last_triggered_at && (
                      <p className="text-muted-foreground mt-0.5 flex items-center gap-1 text-xs">
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
                <div className="flex shrink-0 items-center gap-3">
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
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive h-8 w-8"
                    onClick={() => setDeletingId(w.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) {
            setName("");
            setUrl("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Webhook</DialogTitle>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => createWebhook.mutate()}
              disabled={!url || !name || createWebhook.isPending}
            >
              {createWebhook.isPending ? "Criando..." : "Criar"}
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
