import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useEmployeesPage } from '@/hooks/useEmployeesPage';
import { EmployeeStatsCards } from '@/components/employees/EmployeeStatsCards';
import { EmployeeFilters } from '@/components/employees/EmployeeFilters';
import { EmployeeTable } from '@/components/employees/EmployeeTable';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useChartColors } from '@/hooks/useChartColors';
import { BaseBarChart, BaseDonutChart } from '@/components/charts';

export const EmployeesPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const colors = useChartColors();
  const {
    employees,
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

  const safeTeams = Array.isArray(teams) ? (teams as Array<{ id?: string; name?: string }>).map((t) => ({
    id: String(t.id || ''),
    name: String(t.name || ''),
  })) : [];

  const STATUS_LABELS: Record<string, string> = {
    active: 'Ativos',
    inactive: 'Inativos',
    vacation: 'Férias',
    leave: 'Afastados',
  };

  // Department distribution — usa base completa (não filtrada) para métrica agregada estável
  const departmentData = useMemo(() => {
    const deptMap: Record<string, number> = {};
    employees.forEach((emp) => {
      const dept = String(emp.department || 'Sem Departamento');
      deptMap[dept] = (deptMap[dept] || 0) + 1;
    });
    return Object.entries(deptMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [employees]);

  // Status distribution para pie chart — usa base completa
  const statusData = useMemo(() => {
    const statusMap: Record<string, number> = {};
    employees.forEach((emp) => {
      const status = String(emp.status || 'unknown');
      statusMap[status] = (statusMap[status] || 0) + 1;
    });
    return Object.entries(statusMap).map(([name, value]) => ({
      name: STATUS_LABELS[name] ?? name,
      value,
    }));
  }, [employees]);

  const PIE_COLORS = [colors.success, colors.muted, colors.warning, colors.info, colors.destructive];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('employees.title')}
        description={t('employees.subtitle')}
        showBackButton={false}

        actions={
          <Button onClick={() => navigate('/employees/new')} className="gap-2 h-9">
            <Plus className="h-4 w-4" />
            {t('employees.addEmployee')}
          </Button>
        }
      />

      <EmployeeStatsCards stats={stats} isLoading={loading} />

      {/* Charts Row */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Distribuição por Departamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <BaseBarChart
                data={departmentData}
                series={[{ dataKey: 'value', label: 'Funcionários', color: colors.primary }]}
                xAxisKey="name"
                height={220}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Status dos Funcionários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[160px]">
              <BaseDonutChart
                data={statusData}
                height={160}
                innerRadius={40}
                outerRadius={65}
                colors={PIE_COLORS}
                showLabel={false}
              />
            </div>
            <div className="flex justify-center gap-4 mt-2">
              {statusData.map((s, i) => (
                <div key={s.name} className="flex items-center gap-1.5 text-xs">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-muted-foreground">{s.name}</span>
                  <span className="font-medium">{s.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

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
  );
};

export default EmployeesPage;
