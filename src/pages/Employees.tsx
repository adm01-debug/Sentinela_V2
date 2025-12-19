import { Users, Plus } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { EmployeesSkeleton } from '@/components/PageSkeletons';
import {
  EmployeeStatsCards,
  EmployeeFilters,
  EmployeeTable,
  EmployeeFormDialog,
  DeviceAssignDialog,
} from '@/components/employees';
import { useEmployeesPage } from '@/hooks/useEmployeesPage';

export default function Employees() {
  const {
    // Data
    filteredEmployees,
    teams,
    stats,
    loading,
    selectedEmployee,

    // Filters
    filters,
    setSearchTerm,
    setStatusFilter,
    setTeamFilter,
    clearFilters,

    // Form data
    formData,
    setFormData,
    deviceData,
    setDeviceData,

    // Dialog states
    isCreateOpen,
    isEditOpen,
    isDeviceOpen,
    isDeleteOpen,

    // Actions
    handleCreate,
    handleUpdate,
    handleDelete,
    handleAssignDevice,
    handleUnassignDevice,

    // Dialog handlers
    openCreateDialog,
    openEditDialog,
    openDeviceDialog,
    openDeleteDialog,
    closeCreateDialog,
    closeEditDialog,
    closeDeviceDialog,
    closeDeleteDialog,
  } = useEmployeesPage();

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className="pl-64">
          <Header />
          <main className="p-6">
            <EmployeesSkeleton />
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
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Users className="h-8 w-8" />
                Funcionários
              </h1>
              <p className="text-muted-foreground">
                Gerencie os funcionários monitorados pelo sistema
              </p>
            </div>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Funcionário
            </Button>
          </div>

          {/* Stats Cards */}
          <EmployeeStatsCards stats={stats} />

          {/* Filters & Table */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Funcionários</CardTitle>
              <CardDescription>
                {filteredEmployees.length} funcionário(s) encontrado(s)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <EmployeeFilters
                filters={filters}
                teams={teams}
                onSearchChange={setSearchTerm}
                onStatusChange={setStatusFilter}
                onTeamChange={setTeamFilter}
                onClearFilters={clearFilters}
              />

              <EmployeeTable
                employees={filteredEmployees}
                teams={teams}
                onEdit={openEditDialog}
                onDelete={openDeleteDialog}
                onAssignDevice={openDeviceDialog}
                onUnassignDevice={handleUnassignDevice}
              />
            </CardContent>
          </Card>

          {/* Create Dialog */}
          <EmployeeFormDialog
            open={isCreateOpen}
            onOpenChange={closeCreateDialog}
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleCreate}
            teams={teams}
          />

          {/* Edit Dialog */}
          <EmployeeFormDialog
            open={isEditOpen}
            onOpenChange={closeEditDialog}
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleUpdate}
            teams={teams}
            isEditing
          />

          {/* Device Assignment Dialog */}
          <DeviceAssignDialog
            open={isDeviceOpen}
            onOpenChange={closeDeviceDialog}
            employee={selectedEmployee}
            deviceData={deviceData}
            setDeviceData={setDeviceData}
            onSubmit={handleAssignDevice}
          />

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={isDeleteOpen} onOpenChange={closeDeleteDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir o funcionário{' '}
                  <strong>{selectedEmployee?.name}</strong>? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
}
