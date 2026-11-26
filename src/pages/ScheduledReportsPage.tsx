import { Plus, Clock, Calendar, Mail, Play, Pencil, Trash2, Search, History } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useScheduledReportsPage, REPORT_TYPES } from "@/hooks/useScheduledReportsPage";

const scheduleLabels: Record<string, string> = {
  daily: "Diário",
  weekly: "Semanal",
  monthly: "Mensal",
};

const formatLabels: Record<string, string> = {
  pdf: "PDF",
  excel: "Excel",
  csv: "CSV",
};

export default function ScheduledReportsPage() {
  const {
    searchTerm,
    setSearchTerm,
    typeFilter,
    setTypeFilter,
    isDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    editingReport,
    deletingReport,
    setDeletingReport,
    formData,
    setFormData,
    newRecipient,
    setNewRecipient,
    reports,
    stats,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    isRunning,
    handleOpenCreate,
    handleOpenEdit,
    handleCloseDialog,
    handleSubmit,
    handleDelete,
    handleAddRecipient,
    handleRemoveRecipient,
    handleRunNow,
    executions,
    executionsLoading,
    executionsError,
    executionLimit,
    REPORT_TYPES: reportTypes,
  } = useScheduledReportsPage();

  if (isLoading)
    return (
      <div className="p-6">
        <Skeleton className="h-96" />
      </div>
    );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Relatórios Agendados"
        description="Configure relatórios automáticos e periódicos por e-mail"
        showBackButton={false}
        actions={
          <Button onClick={handleOpenCreate} className="h-9 gap-2">
            <Plus className="h-4 w-4" />
            Novo Agendamento
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <Calendar className="text-primary mx-auto h-5 w-5" />
            <p className="mt-1 text-2xl font-bold">{stats.total}</p>
            <p className="text-muted-foreground text-xs">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <Clock className="text-success mx-auto h-5 w-5" />
            <p className="mt-1 text-2xl font-bold">{stats.active}</p>
            <p className="text-muted-foreground text-xs">Ativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <Mail className="text-info mx-auto h-5 w-5" />
            <p className="mt-1 text-2xl font-bold">{stats.daily}</p>
            <p className="text-muted-foreground text-xs">Diários</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <Calendar className="text-warning mx-auto h-5 w-5" />
            <p className="mt-1 text-2xl font-bold">{stats.weekly}</p>
            <p className="text-muted-foreground text-xs">Semanais</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative min-w-[200px] flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Buscar relatório..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {reportTypes.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {reports.length === 0 ? (
        <Card>
          <CardContent className="text-muted-foreground py-12 text-center">
            <Clock className="mx-auto mb-4 h-12 w-12 opacity-50" />
            <p>Nenhum relatório agendado.</p>
            <p className="mt-1 text-sm">
              Crie um agendamento para receber relatórios automáticos por e-mail.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <Card key={r.id}>
              <CardContent className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-medium">{r.name}</p>
                    <Badge variant={r.is_active ? "default" : "secondary"} className="text-[10px]">
                      {r.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {scheduleLabels[r.schedule] || r.schedule}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {formatLabels[r.format] || r.format}
                    </Badge>
                  </div>
                  <div className="text-muted-foreground mt-1 flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {r.schedule_time}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {r.recipients.length} destinatário(s)
                    </span>
                    {r.last_sent && (
                      <span>
                        Enviado{" "}
                        {formatDistanceToNow(new Date(r.last_sent), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={isRunning}
                    onClick={() => handleRunNow(r.id)}
                    title="Executar agora"
                  >
                    <Play className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleOpenEdit(r)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive h-8 w-8"
                    onClick={() => {
                      setDeletingReport(r);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Ultimas execucoes -- report_logs gravado pela edge send-scheduled-report */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-sm font-medium">
            <History className="text-muted-foreground h-4 w-4" />
            Últimas execuções
          </h2>
          <span className="text-muted-foreground text-xs">
            Até {executionLimit} registros · a edge de envio registra execuções concluídas
          </span>
        </div>
        {executionsError ? (
          <Card>
            <CardContent className="text-destructive py-6 text-center text-sm">
              {executionsError}
            </CardContent>
          </Card>
        ) : executionsLoading ? (
          <Skeleton className="h-24" />
        ) : executions.length === 0 ? (
          <Card>
            <CardContent className="text-muted-foreground py-8 text-center text-sm">
              Nenhuma execução registrada ainda. Use &quot;Executar&quot; em um agendamento para
              gerar o primeiro registro.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {executions.map((execution) => (
              <Card key={execution.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-3 p-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{execution.report_name}</p>
                    <p className="text-muted-foreground text-xs">
                      {formatDistanceToNow(new Date(execution.executed_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                      {" · "}
                      {execution.manual ? "manual" : "agendada"}
                      {" · "}
                      {execution.records_count}{" "}
                      {execution.records_count === 1 ? "registro" : "registros"}
                    </p>
                    {execution.error_message && (
                      <p className="text-destructive text-xs">{execution.error_message}</p>
                    )}
                  </div>
                  <Badge variant={execution.status === "success" ? "secondary" : "destructive"}>
                    {execution.status === "success" ? "Sucesso" : execution.status}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseDialog();
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingReport ? "Editar Agendamento" : "Novo Agendamento"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Relatório Semanal de Produtividade"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tipo</Label>
                <Select
                  value={formData.report_type}
                  onValueChange={(v) => setFormData({ ...formData, report_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REPORT_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Formato</Label>
                <Select
                  value={formData.format}
                  onValueChange={(v) => setFormData({ ...formData, format: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Frequência</Label>
                <Select
                  value={formData.schedule}
                  onValueChange={(v) => setFormData({ ...formData, schedule: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Diário</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Horário</Label>
                <Input
                  type="time"
                  value={formData.schedule_time}
                  onChange={(e) => setFormData({ ...formData, schedule_time: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Destinatários</Label>
              <div className="mt-1 flex gap-2">
                <Input
                  value={newRecipient}
                  onChange={(e) => setNewRecipient(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddRecipient()}
                  placeholder="email@empresa.com"
                />
                <Button type="button" variant="outline" size="sm" onClick={handleAddRecipient}>
                  Adicionar
                </Button>
              </div>
              {formData.recipients.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {formData.recipients.map((email) => (
                    <Badge key={email} variant="secondary" className="gap-1">
                      {email}
                      <button
                        onClick={() => handleRemoveRecipient(email)}
                        className="text-muted-foreground hover:text-foreground ml-1"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label>Ativo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={!formData.name || isCreating || isUpdating}>
              {isCreating || isUpdating ? "Salvando..." : editingReport ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir agendamento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação é irreversível. O relatório &quot;{deletingReport?.name}&quot; não será mais
              enviado automaticamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export { ScheduledReportsPage };
