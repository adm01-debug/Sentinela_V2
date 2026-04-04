import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useEmployeesPage } from '@/hooks/useEmployeesPage';
import { EmployeeStatsCards } from '@/components/employees/EmployeeStatsCards';
import { EmployeeFilters } from '@/components/employees/EmployeeFilters';
import { EmployeeTable } from '@/components/employees/EmployeeTable';
import { PageTransition } from '@/components/PageTransition';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useChartColors } from '@/hooks/useChartColors';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

export const EmployeesPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const colors = useChartColors();
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

  const safeTeams = Array.isArray(teams) ? (teams as Array<{ id?: string; name?: string }>).map((t) => ({
    id: String(t.id || ''),
    name: String(t.name || ''),
  })) : [];

  // Department distribution chart data
  const departmentData = useMemo(() => {
    const deptMap: Record<string, number> = {};
    filteredEmployees.forEach((emp) => {
      const dept = String(emp.department || 'Sem Departamento');
      deptMap[dept] = (deptMap[dept] || 0) + 1;
    });
    return Object.entries(deptMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [filteredEmployees]);

  // Status distribution for pie chart
  const statusData = useMemo(() => {
    const statusMap: Record<string, number> = {};
    filteredEmployees.forEach((emp) => {
      const status = String(emp.status || 'unknown');
      statusMap[status] = (statusMap[status] || 0) + 1;
    });
    return Object.entries(statusMap).map(([name, value]) => ({ name: name === 'active' ? 'Ativos' : name === 'inactive' ? 'Inativos' : name, value }));
  }, [filteredEmployees]);

  const PIE_COLORS = [colors.success, colors.muted, colors.warning, colors.destructive];

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{t('employees.title')}</h1>
            <p className="text-sm text-muted-foreground">{t('employees.subtitle')}</p>
          </div>
          <Button onClick={() => navigate('/employees/new')} className="gap-2">
            <Plus className="h-4 w-4" />
            {t('employees.addEmployee')}
          </Button>
        </div>

        <EmployeeStatsCards stats={stats} isLoading={loading} />

        {/* Charts Row */}
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-5">
          <Card className="lg:col-span-3">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Distribuição por Departamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={departmentData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                    <XAxis dataKey="name" tick={{ fill: colors.muted, fontSize: 11 }} stroke={colors.border} />
                    <YAxis tick={{ fill: colors.muted, fontSize: 11 }} stroke={colors.border} allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                    <Bar dataKey="value" name="Funcionários" fill={colors.primary} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Status dos Funcionários</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                      {statusData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
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
    </PageTransition>
  );
};

export default EmployeesPage;
