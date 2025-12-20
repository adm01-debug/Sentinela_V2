import React, { Suspense, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { Skeleton } from '@/components/ui/skeleton';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmployeesSkeleton } from '@/components/PageSkeletons';
import { useEmployeesPage } from '@/hooks/useEmployeesPage';
import { Users, Plus } from 'lucide-react';

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
import {
  EmployeeStatsCards,
  EmployeeFilters,
  EmployeeTable,
  EmployeeFormDialog,
  DeviceAssignDialog,
} from '@/components/employees';

const EmployeesContent = memo(function EmployeesContent() {
  const { t } = useTranslation();
  const {
    filteredEmployees,
    teams,
    stats,
    loading,
    selectedEmployee,
    filters,
    setSearchTerm,
    setStatusFilter,
    setTeamFilter,
    clearFilters,
    formData,
    setFormData,
    deviceData,
    setDeviceData,
    isCreateOpen,
    isEditOpen,
    isDeviceOpen,
    isDeleteOpen,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleAssignDevice,
    handleUnassignDevice,
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Users className="h-8 w-8" />
                {t('employees.title')}
              </h1>
              <p className="text-muted-foreground">
                {t('employees.subtitle')}
              </p>
            </div>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              {t('employees.addEmployee')}
            </Button>
          </div>

          <EmployeeStatsCards stats={stats} />

          <Card>
            <CardHeader>
              <CardTitle>{t('employees.title')}</CardTitle>
              <CardDescription>
                {filteredEmployees.length} {t('common.noResults').replace('Nenhum resultado encontrado', 'funcionário(s) encontrado(s)')}
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

          <EmployeeFormDialog
            open={isCreateOpen}
            onOpenChange={closeCreateDialog}
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleCreate}
            teams={teams}
          />

          <EmployeeFormDialog
            open={isEditOpen}
            onOpenChange={closeEditDialog}
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleUpdate}
            teams={teams}
            isEditing
          />

          <DeviceAssignDialog
            open={isDeviceOpen}
            onOpenChange={closeDeviceDialog}
            employee={selectedEmployee}
            deviceData={deviceData}
            setDeviceData={setDeviceData}
            onSubmit={handleAssignDevice}
          />

          <AlertDialog open={isDeleteOpen} onOpenChange={closeDeleteDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('employees.confirmDelete')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('employees.confirmDelete')} <strong>{selectedEmployee?.name}</strong>?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {t('common.delete')}
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

export default function Employees() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSkeleton />}>
        <EmployeesContent />
      </Suspense>
    </ErrorBoundary>
  );
}
