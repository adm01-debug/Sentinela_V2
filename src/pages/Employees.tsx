import React, { Suspense, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { ErrorBoundary } from 'react-error-boundary';
import { Skeleton } from '@/components/ui/skeleton';
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
    return <EmployeesSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header responsivo */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 sm:h-8 sm:w-8" />
            {t('employees.title')}
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            {t('employees.subtitle')}
          </p>
        </div>
        <Button onClick={openCreateDialog} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          {t('employees.addEmployee')}
        </Button>
      </div>

      <EmployeeStatsCards stats={stats} />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg sm:text-xl">{t('employees.title')}</CardTitle>
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

          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="min-w-[600px] sm:min-w-0 px-4 sm:px-0">
              <EmployeeTable
                employees={filteredEmployees}
                teams={teams}
                onEdit={openEditDialog}
                onDelete={openDeleteDialog}
                onAssignDevice={openDeviceDialog}
                onUnassignDevice={handleUnassignDevice}
              />
            </div>
          </div>
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
        <AlertDialogContent className="max-w-[95vw] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('employees.confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('employees.confirmDelete')} <strong>{selectedEmployee?.name}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
            <AlertDialogCancel className="w-full sm:w-auto">{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
});

const LoadingSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-8 w-64" />
    <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
      {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
    </div>
    <Skeleton className="h-96" />
  </div>
);

export default function Employees() {
  return (
    <ErrorBoundary fallback={<LoadingSkeleton />}>
      <Suspense fallback={<LoadingSkeleton />}>
        <EmployeesContent />
      </Suspense>
    </ErrorBoundary>
  );
}
