import { useTranslation } from 'react-i18next';
import { useEmployeesPage } from '@/hooks/useEmployeesPage';
import { EmployeeStatsCards } from '@/components/employees/EmployeeStatsCards';
import { EmployeeFilters } from '@/components/employees/EmployeeFilters';
import { EmployeeTable } from '@/components/employees/EmployeeTable';
import { PageTransition } from '@/components/PageTransition';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const EmployeesPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    filteredEmployees,
    teams,
    stats,
    loading,
    filters,
    setSearchTerm,
    setStatusFilter,
    setTeamFilter,
    clearFilters,
    openEditDialog,
    openDeleteDialog,
    openDeviceDialog,
    handleUnassignDevice,
  } = useEmployeesPage();

  const safeTeams = Array.isArray(teams) ? teams.map((t: Record<string, unknown>) => ({
    id: String(t.id || ''),
    name: String(t.name || ''),
  })) : [];

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{t('employees.title')}</h1>
            <p className="text-sm text-muted-foreground">
              {t('employees.subtitle')}
            </p>
          </div>
          <Button onClick={() => navigate('/employees/new')} className="gap-2">
            <Plus className="h-4 w-4" />
            {t('employees.addEmployee')}
          </Button>
        </div>

        <EmployeeStatsCards stats={stats} isLoading={loading} />

        <EmployeeFilters
          filters={filters}
          teams={safeTeams}
          onSearchChange={setSearchTerm}
          onStatusChange={setStatusFilter}
          onTeamChange={setTeamFilter}
          onClearFilters={clearFilters}
        />

        <EmployeeTable
          employees={filteredEmployees}
          teams={safeTeams}
          onEdit={openEditDialog}
          onDelete={openDeleteDialog}
          onAssignDevice={openDeviceDialog}
          onUnassignDevice={handleUnassignDevice}
        />
      </div>
    </PageTransition>
  );
};

export default EmployeesPage;
