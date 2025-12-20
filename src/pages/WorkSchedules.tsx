import React, { Suspense, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Clock, Users, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { Spinner } from '@/components/LoadingState';
import {
  ScheduleStatsCards,
  SchedulesList,
  ScheduleFormDialog,
  OvertimeRequestsList,
  EmployeeSchedulesTable,
} from '@/components/schedules';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { Skeleton } from '@/components/ui/skeleton';
import { useWorkSchedulesPage } from '@/hooks/useWorkSchedulesPage';

const WorkSchedulesContent = memo(function WorkSchedulesContent() {
  const navigate = useNavigate();
  const {
    // Data
    filteredSchedules,
    filteredEmployeeSchedules,
    employees,
    schedules,
    pendingOvertimeRequests,
    overtimeRequests,
    stats,
    loading,
    scheduleToDelete,

    // State
    searchTerm,
    setSearchTerm,
    activeTab,
    setActiveTab,
    selectedSchedule,

    // Forms
    scheduleForm,
    setScheduleForm,
    assignForm,
    setAssignForm,
    toggleWorkDay,

    // Dialogs
    isScheduleDialogOpen,
    setIsScheduleDialogOpen,
    isAssignDialogOpen,
    setIsAssignDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,

    // Actions
    handleCreateSchedule,
    handleUpdateSchedule,
    handleDeleteSchedule,
    handleAssignSchedule,
    handleRemoveAssignment,
    handleApproveOvertime,
    handleRejectOvertime,

    // Dialog handlers
    openCreateScheduleDialog,
    openEditScheduleDialog,
    openDeleteDialog,
    openAssignDialog,
  } = useWorkSchedulesPage();

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className="pl-64">
          <Header />
          <main className="p-6 flex items-center justify-center min-h-[60vh]">
            <Spinner size="lg" />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="pl-64">
        <Header />
        <main className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/settings')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                  <Clock className="h-8 w-8" />
                  Horários de Trabalho
                </h1>
                <p className="text-muted-foreground">
                  Configure jornadas de trabalho e controle de horas
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={openAssignDialog}>
                <Users className="mr-2 h-4 w-4" />
                Atribuir Horário
              </Button>
              <Button onClick={openCreateScheduleDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Horário
              </Button>
            </div>
          </div>

          {/* Stats */}
          <ScheduleStatsCards stats={stats} />

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="schedules">Horários</TabsTrigger>
              <TabsTrigger value="assignments">Atribuições</TabsTrigger>
              <TabsTrigger value="overtime">
                Horas Extras
                {pendingOvertimeRequests.length > 0 && (
                  <span className="ml-2 bg-warning text-warning-foreground px-2 py-0.5 rounded-full text-xs">
                    {pendingOvertimeRequests.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="schedules" className="mt-6">
              <SchedulesList
                schedules={filteredSchedules}
                onEdit={openEditScheduleDialog}
                onDelete={openDeleteDialog}
              />
            </TabsContent>

            <TabsContent value="assignments" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Funcionários com Horário</CardTitle>
                  <CardDescription>
                    {filteredEmployeeSchedules.length} atribuições ativas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <EmployeeSchedulesTable
                    employeeSchedules={filteredEmployeeSchedules}
                    employees={employees}
                    schedules={schedules}
                    onRemove={handleRemoveAssignment}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="overtime" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Solicitações de Hora Extra</CardTitle>
                  <CardDescription>
                    {overtimeRequests.length} solicitações
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <OvertimeRequestsList
                    requests={overtimeRequests}
                    employees={employees}
                    onApprove={handleApproveOvertime}
                    onReject={handleRejectOvertime}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Schedule Form Dialog */}
          <ScheduleFormDialog
            open={isScheduleDialogOpen}
            onOpenChange={setIsScheduleDialogOpen}
            formData={scheduleForm}
            setFormData={setScheduleForm}
            onToggleWorkDay={toggleWorkDay}
            onSubmit={selectedSchedule ? handleUpdateSchedule : handleCreateSchedule}
            isEditing={!!selectedSchedule}
          />

          {/* Assign Dialog */}
          <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Atribuir Horário</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Funcionário</Label>
                  <Select
                    value={assignForm.employee_id}
                    onValueChange={(v) => setAssignForm({ ...assignForm, employee_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Horário</Label>
                  <Select
                    value={assignForm.schedule_id}
                    onValueChange={(v) => setAssignForm({ ...assignForm, schedule_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {schedules.map((sch) => (
                        <SelectItem key={sch.id} value={sch.id}>{sch.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAssignSchedule}>Atribuir</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Dialog */}
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir Horário</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir o horário "{scheduleToDelete?.name}"?
                  Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteSchedule}
                  className="bg-destructive text-destructive-foreground"
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </main>
      </div>
    </div>
  );
});

const LoadingSkeleton = () => (
  <div className="space-y-4 p-6">
    <Skeleton className="h-8 w-64" />
    <div className="grid gap-4 md:grid-cols-4">
      {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
    </div>
    <Skeleton className="h-96" />
  </div>
);

export default function WorkSchedules() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSkeleton />}>
        <WorkSchedulesContent />
      </Suspense>
    </ErrorBoundary>
  );
}
