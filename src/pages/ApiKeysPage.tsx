import { useState } from "react";
import { KeyRound, Plus, Copy, Trash2, Power, RotateCcw, Search, Eye } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useAgentKeysPage } from "@/hooks/useAgentKeysPage";

interface CreateForm {
  key_name: string;
  employee_name: string;
  device_name: string;
}

const emptyForm: CreateForm = { key_name: "", employee_name: "", device_name: "" };

export default function ApiKeysPage() {
  const {
    keys,
    stats,
    search,
    statusFilter,
    selectedKey,
    isCreateDialogOpen,
    isDetailsOpen,
    isLoading,
    handleSearchChange,
    handleStatusFilterChange,
    handleOpenCreateDialog,
    handleCloseCreateDialog,
    handleCreateKey,
    handleViewDetails,
    handleCloseDetails,
    handleRevokeKey,
    handleReactivateKey,
    handleDeleteKey,
    handleCopyKey,
    isCreating,
    isRevoking,
    isDeleting,
  } = useAgentKeysPage();

  const [form, setForm] = useState<CreateForm>(emptyForm);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<"revoke" | "reactivate" | "delete" | null>(
    null
  );

  const updateField = (field: keyof CreateForm, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const submitCreate = async () => {
    const created = await handleCreateKey({
      key_name: form.key_name,
      employee_name: form.employee_name || undefined,
      device_name: form.device_name || undefined,
    });
    setNewKey(created);
    setForm(emptyForm);
  };

  const runConfirmAction = () => {
    if (!selectedKey || !confirmAction) return;
    if (confirmAction === "revoke") handleRevokeKey(selectedKey.id);
    if (confirmAction === "reactivate") handleReactivateKey(selectedKey.id);
    if (confirmAction === "delete") handleDeleteKey(selectedKey.id);
    setConfirmAction(null);
  };

  const statCards = [
    { label: "Total de chaves", value: stats.total },
    { label: "Ativas", value: stats.active },
    { label: "Usadas nas últimas 24h", value: stats.recentlyUsed },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chaves de API"
        description="Gerencie as chaves de autentica\u00e7\u00e3o do desktop agent"
        showBackButton={false}
        actions={
          <Button onClick={handleOpenCreateDialog} className="h-9 gap-2">
            <Plus className="h-4 w-4" />
            Nova Chave
          </Button>
        }
      />

      {isLoading ? (
        <Skeleton className="h-96" />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            {statCards.map((s) => (
              <Card key={s.label}>
                <CardContent className="p-4">
                  <p className="text-muted-foreground text-sm">{s.label}</p>
                  <p className="mt-1 text-2xl font-bold">{s.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-md">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Buscar por nome ou funcion\u00e1rio..."
                className="pl-9"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativas</SelectItem>
                <SelectItem value="inactive">Revogadas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {keys.length === 0 ? (
            <Card>
              <CardContent className="text-muted-foreground py-12 text-center">
                <KeyRound className="mx-auto mb-4 h-12 w-12 opacity-50" />
                <p>Nenhuma chave de API encontrada.</p>
                <p className="mt-1 text-sm">Crie uma chave para autenticar o desktop agent.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {keys.map((k) => (
                <Card key={k.id}>
                  <CardContent className="flex items-center justify-between gap-3 p-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <KeyRound className="text-muted-foreground h-5 w-5 shrink-0" />
                      <div className="min-w-0">
                        <p className="truncate font-medium">{k.key_name}</p>
                        <p className="text-muted-foreground truncate text-sm">
                          {k.employee_name || k.device_name || "Sem v\u00ednculo"}
                          {k.last_seen_at
                            ? " \u00b7 \u00faltima atividade " +
                              new Date(k.last_seen_at).toLocaleString()
                            : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge variant={k.is_active ? "success" : "destructive"}>
                        {k.is_active ? "Ativa" : "Revogada"}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1"
                        onClick={() => handleViewDetails(k)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Detalhes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <Dialog open={isCreateDialogOpen} onOpenChange={handleCloseCreateDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Chave de API</DialogTitle>
                <DialogDescription>
                  Gere uma chave para autenticar o desktop agent em um novo dispositivo.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Nome da chave</Label>
                  <Input
                    value={form.key_name}
                    onChange={(e) => updateField("key_name", e.target.value)}
                    placeholder="Ex: Notebook Jo\u00e3o - RH"
                  />
                </div>
                <div>
                  <Label>Funcion\u00e1rio (opcional)</Label>
                  <Input
                    value={form.employee_name}
                    onChange={(e) => updateField("employee_name", e.target.value)}
                    placeholder="Nome do funcion\u00e1rio"
                  />
                </div>
                <div>
                  <Label>Dispositivo (opcional)</Label>
                  <Input
                    value={form.device_name}
                    onChange={(e) => updateField("device_name", e.target.value)}
                    placeholder="Hostname ou identifica\u00e7\u00e3o"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleCloseCreateDialog}>
                  Cancelar
                </Button>
                <Button onClick={submitCreate} disabled={!form.key_name || isCreating}>
                  {isCreating ? "Gerando..." : "Gerar chave"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog
            open={newKey !== null}
            onOpenChange={(open) => {
              if (!open) setNewKey(null);
            }}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Chave gerada</DialogTitle>
                <DialogDescription>
                  Copie agora: esta \u00e9 a \u00fanica vez que a chave completa ser\u00e1 exibida.
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center gap-2">
                <code className="bg-muted flex-1 rounded border p-2 text-sm break-all">
                  {newKey ?? ""}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => newKey && handleCopyKey(newKey)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <DialogFooter>
                <Button onClick={() => setNewKey(null)}>Fechar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isDetailsOpen} onOpenChange={handleCloseDetails}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Detalhes da chave</DialogTitle>
              </DialogHeader>
              {selectedKey && (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nome</span>
                    <span className="font-medium">{selectedKey.key_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Chave</span>
                    <span className="flex items-center gap-1 font-mono">
                      {selectedKey.agent_key.slice(0, 8)}...{" "}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-1"
                        onClick={() => handleCopyKey(selectedKey.agent_key)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Funcion\u00e1rio</span>
                    <span>{selectedKey.employee_name || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dispositivo</span>
                    <span>{selectedKey.device_name || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant={selectedKey.is_active ? "success" : "destructive"}>
                      {selectedKey.is_active ? "Ativa" : "Revogada"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Criada em</span>
                    <span>{new Date(selectedKey.created_at).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">\u00daltima atividade</span>
                    <span>
                      {selectedKey.last_seen_at
                        ? new Date(selectedKey.last_seen_at).toLocaleString()
                        : "Nunca"}
                    </span>
                  </div>
                </div>
              )}
              <DialogFooter className="flex-wrap gap-2">
                {selectedKey?.is_active ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={() => setConfirmAction("revoke")}
                      disabled={isRevoking}
                    >
                      <Power className="h-3.5 w-3.5" /> Revogar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="gap-1"
                      onClick={() => setConfirmAction("delete")}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Excluir
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() => setConfirmAction("reactivate")}
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Reativar
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={handleCloseDetails}>
                  Fechar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <AlertDialog
            open={confirmAction !== null}
            onOpenChange={(open) => {
              if (!open) setConfirmAction(null);
            }}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {confirmAction === "revoke" && "Revogar chave"}
                  {confirmAction === "reactivate" && "Reativar chave"}
                  {confirmAction === "delete" && "Excluir chave"}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {confirmAction === "revoke" &&
                    "A chave deixar\u00e1 de autenticar o desktop agent imediatamente."}
                  {confirmAction === "reactivate" &&
                    "A chave voltar\u00e1 a autenticar o desktop agent."}
                  {confirmAction === "delete" &&
                    "A chave ser\u00e1 removida permanentemente. Esta a\u00e7\u00e3o n\u00e3o pode ser desfeita."}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={runConfirmAction}
                  className={
                    confirmAction === "delete" ? "bg-destructive text-destructive-foreground" : ""
                  }
                >
                  Confirmar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
}
