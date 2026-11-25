import {
  Clock,
  Plus,
  Edit,
  Trash2,
  Users,
  Calendar,
  Search,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkSchedulesPage, formatWorkDays, WEEKDAYS } from "@/hooks/useWorkSchedulesPage";

const rotuloSituacao: Record<string, string> = {
  vigente: "Vigente nesta data",
  substituida: "Fora de vigência",
  encerrada: "Encerrada",
  futura: "Ainda não vale",
};

export default function WorkSchedulesPage() {
  const {
    filteredSchedules,
    filteredEmployeeSchedules,
    employees,
    pendingOvertimeRequests,
    stats,
    loading,
    searchTerm,
    setSearchTerm,
    activeTab,
    setActiveTab,
    dataVigente,
    setDataVigente,
    vigentesPorFuncionario,
    situacoesPorAtribuicao,
    funcionariosComVigente,
    scheduleForm,
    setScheduleForm,
    assignForm,
    setAssignForm,
    toggleWorkDay,
    isScheduleDialogOpen,
    setIsScheduleDialogOpen,
    isAssignDialogOpen,
    setIsAssignDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    selectedSchedule,
    scheduleToDelete,
    handleCreateSchedule,
    handleUpdateSchedule,
    handleDeleteSchedule,
    handleAssignSchedule,
    handleRemoveAssignment,
    handleApproveOvertime,
    handleRejectOvertime,
    openCreateScheduleDialog,
    openEditScheduleDialog,
    openDeleteDialog,
    openAssignDialog,
  } = useWorkSchedulesPage();

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Escalas de Trabalho"
        description="Gerencie horários e escalas"
        showBackButton={false}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={openAssignDialog} className="h-9 gap-2">
              <Users className="h-4 w-4" />
              Atribuir
            </Button>
            <Button onClick={openCreateScheduleDialog} className="h-9 gap-2">
              <Plus className="h-4 w-4" />
              Nova Escala
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <Calendar className="text-primary mx-auto h-5 w-5" />
            <p className="mt-1 text-2xl font-bold">{stats.totalSchedules}</p>
            <p className="text-muted-foreground text-xs">Escalas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <Users className="text-info mx-auto h-5 w-5" />
            <p className="mt-1 text-2xl font-bold">{stats.totalAssignments}</p>
            <p className="text-muted-foreground text-xs">Atribuições</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <Clock className="text-warning mx-auto h-5 w-5" />
            <p className="mt-1 text-2xl font-bold">{stats.pendingOvertimeRequests}</p>
            <p className="text-muted-foreground text-xs">Horas Extra Pendentes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <XCircle className="text-destructive mx-auto h-5 w-5" />
            <p className="mt-1 text-2xl font-bold">{stats.recentBlocks}</p>
            <p className="text-muted-foreground text-xs">Bloqueios (24h)</p>
          </CardContent>
        </Card>
      </div>

      <div className="relative max-w-md">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder="Buscar escalas..."
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="schedules">Escalas</TabsTrigger>
          <TabsTrigger value="assignments">Atribuições</TabsTrigger>
          <TabsTrigger value="overtime">
            Horas Extra{" "}
            {pendingOvertimeRequests.length > 0 && (
              <Badge className="ml-1" variant="destructive">
                {pendingOvertimeRequests.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="schedules" className="mt-4">
          {filteredSchedules.length === 0 ? (
            <Card>
              <CardContent className="text-muted-foreground py-12 text-center">
                <Clock className="mx-auto mb-4 h-12 w-12 opacity-50" />
                <p>Nenhuma escala encontrada.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredSchedules.map((s) => (
                <Card key={s.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{s.name}</CardTitle>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditScheduleDialog(s)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openDeleteDialog(s)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      {s.description || "Sem descrição"}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <Badge variant="outline">
                        {s.start_time} - {s.end_time}
                      </Badge>
                      <Badge variant="secondary">{formatWorkDays(s.work_days || [])}</Badge>
                    </div>
                    <div className="mt-2 flex gap-1">
                      {s.allow_overtime && (
                        <Badge variant="outline" className="text-xs">
                          HE permitida
                        </Badge>
                      )}
                      {s.auto_block_enabled && (
                        <Badge variant="outline" className="text-xs">
                          Bloqueio fora horário
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="assignments" className="mt-4 space-y-3">
          <Card>
            <CardContent className="flex flex-wrap items-end gap-4 p-4">
              <div className="space-y-1">
                <Label htmlFor="data-vigente">Escala vigente na data</Label>
                <Input
                  id="data-vigente"
                  type="date"
                  className="w-44"
                  value={dataVigente}
                  onChange={(e) => setDataVigente(e.target.value)}
                />
              </div>
              <p className="text-muted-foreground pb-2 text-sm">
                {funcionariosComVigente} de {Object.keys(vigentesPorFuncionario).length}{" "}
                funcionário(s) com escala vigente em {dataVigente}.
              </p>
            </CardContent>
          </Card>
          {filteredEmployeeSchedules.length === 0 ? (
            <Card>
              <CardContent className="text-muted-foreground py-12 text-center">
                <Users className="mx-auto mb-4 h-12 w-12 opacity-50" />
                <p>Nenhuma escala atribuída.</p>
                <p className="mt-1 text-xs">
                  Use o botão Atribuir para vincular uma escala a um funcionário.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredEmployeeSchedules.map((es) => (
              <Card key={es.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{es.employee_name || "Funcionário"}</p>
                      <Badge
                        variant={
                          situacoesPorAtribuicao[es.id] === "vigente" ? "default" : "secondary"
                        }
                      >
                        {rotuloSituacao[situacoesPorAtribuicao[es.id]]}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {es.schedule_name || "Escala removida"}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      A partir de {es.effective_from}
                      {es.effective_until ? ` até ${es.effective_until}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {vigentesPorFuncionario[es.employee_id]?.id === es.id && (
                      <span className="text-xs text-green-600">Vale em {dataVigente}</span>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveAssignment(es.id)}
                    >
                      <Trash2 className="mr-1 h-3 w-3" />
                      Remover
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="overtime" className="mt-4 space-y-3">
          {pendingOvertimeRequests.length === 0 ? (
            <Card>
              <CardContent className="text-muted-foreground py-12 text-center">
                <p>Nenhuma solicitação de hora extra pendente.</p>
              </CardContent>
            </Card>
          ) : (
            pendingOvertimeRequests.map((req) => (
              <Card key={req.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{req.employee_name || "Funcionário"}</p>
                    <p className="text-muted-foreground text-sm">{req.reason}</p>
                    <p className="text-muted-foreground text-xs">{req.hours}h solicitadas</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRejectOvertime(req.id)}
                    >
                      <XCircle className="mr-1 h-3 w-3" />
                      Rejeitar
                    </Button>
                    <Button size="sm" onClick={() => handleApproveOvertime(req.id)}>
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Aprovar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Create/Edit Schedule Dialog */}
      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedSchedule ? "Editar Escala" : "Nova Escala"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome</Label>
              <Input
                value={scheduleForm.name}
                onChange={(e) => setScheduleForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label>Descrição</Label>
              <Input
                value={scheduleForm.description}
                onChange={(e) =>
                  setScheduleForm((prev) => ({ ...prev, description: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Início</Label>
                <Input
                  type="time"
                  value={scheduleForm.start_time}
                  onChange={(e) =>
                    setScheduleForm((prev) => ({ ...prev, start_time: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Fim</Label>
                <Input
                  type="time"
                  value={scheduleForm.end_time}
                  onChange={(e) =>
                    setScheduleForm((prev) => ({ ...prev, end_time: e.target.value }))
                  }
                />
              </div>
            </div>
            <div>
              <Label>Dias de Trabalho</Label>
              <div className="mt-1 flex gap-1">
                {WEEKDAYS.map((d) => (
                  <Button
                    key={d.value}
                    type="button"
                    variant={scheduleForm.work_days.includes(d.value) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleWorkDay(d.value)}
                  >
                    {d.short}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label>Hora extra permitida</Label>
              <Switch
                checked={scheduleForm.overtime_allowed}
                onCheckedChange={(v) =>
                  setScheduleForm((prev) => ({ ...prev, overtime_allowed: v }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Bloquear fora do horário</Label>
              <Switch
                checked={scheduleForm.block_outside_hours}
                onCheckedChange={(v) =>
                  setScheduleForm((prev) => ({ ...prev, block_outside_hours: v }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={selectedSchedule ? handleUpdateSchedule : handleCreateSchedule}
              disabled={!scheduleForm.name}
            >
              {selectedSchedule ? "Atualizar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atribuir Escala</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Funcionário</Label>
              <Select
                value={assignForm.employee_id}
                onValueChange={(v) => setAssignForm((prev) => ({ ...prev, employee_id: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Escala</Label>
              <Select
                value={assignForm.schedule_id}
                onValueChange={(v) => setAssignForm((prev) => ({ ...prev, schedule_id: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {filteredSchedules.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Data Efetiva</Label>
              <Input
                type="date"
                value={assignForm.effective_date}
                onChange={(e) =>
                  setAssignForm((prev) => ({ ...prev, effective_date: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleAssignSchedule}
              disabled={!assignForm.employee_id || !assignForm.schedule_id}
            >
              Atribuir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Escala?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação é irreversível. A escala {scheduleToDelete?.name} será removida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSchedule}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export { WorkSchedulesPage };
