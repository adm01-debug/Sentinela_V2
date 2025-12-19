import { useState, useMemo, useCallback } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, Download, ArrowUpDown } from 'lucide-react';
import { DateRangePicker } from '@/components/DateRangePicker';
import { ProductivityComparisonSkeleton } from '@/components/PageSkeletons';
import { ProductivityStatsCards, ProductivityTable } from '@/components/productivity';
import {
  useProductivityData,
  useProductivityStats,
  useDepartments,
  type ProductivityFilters,
} from '@/hooks/useProductivityComparison';

export default function ProductivityComparison() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<ProductivityFilters>({
    sortBy: 'score',
    sortOrder: 'desc',
  });

  // Queries
  const { data: employees = [], isLoading } = useProductivityData(filters);
  const { data: stats, isLoading: statsLoading } = useProductivityStats(filters);
  const { data: departments = [] } = useDepartments();

  // Filtered employees by search
  const filteredEmployees = useMemo(() => {
    if (!searchTerm) return employees;
    const term = searchTerm.toLowerCase();
    return employees.filter(
      (emp) =>
        emp.full_name.toLowerCase().includes(term) ||
        emp.department?.toLowerCase().includes(term) ||
        emp.team?.toLowerCase().includes(term)
    );
  }, [employees, searchTerm]);

  // Handlers
  const handleDepartmentChange = useCallback((value: string) => {
    setFilters((prev) => ({
      ...prev,
      department: value === 'all' ? undefined : value,
    }));
  }, []);

  const handleSortChange = useCallback((value: string) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: value as 'score' | 'active_time' | 'name',
    }));
  }, []);

  const handleDateRangeChange = useCallback((range: { from: Date; to: Date } | undefined) => {
    setFilters((prev) => ({
      ...prev,
      dateRange: range
        ? { from: range.from.toISOString(), to: range.to.toISOString() }
        : undefined,
    }));
  }, []);

  const toggleSortOrder = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      sortOrder: prev.sortOrder === 'desc' ? 'asc' : 'desc',
    }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setFilters({ sortBy: 'score', sortOrder: 'desc' });
  }, []);

  const handleExport = useCallback(() => {
    // Export logic
    const csv = [
      ['Nome', 'Departamento', 'Produtividade', 'Tempo Ativo', 'Violações'].join(','),
      ...filteredEmployees.map((e) =>
        [e.full_name, e.department, e.productivity_score, e.active_time_hours, e.violations_count].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'produtividade.csv';
    a.click();
  }, [filteredEmployees]);

  if (isLoading && !employees.length) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-6">
          <ProductivityComparisonSkeleton />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">Comparativo de Produtividade</h1>
            <p className="text-muted-foreground">
              Analise e compare a produtividade dos funcionários
            </p>
          </div>
          <Button onClick={handleExport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>

        <ProductivityStatsCards stats={stats} isLoading={statsLoading} />

        <Card>
          <CardHeader>
            <CardTitle>Ranking de Produtividade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar funcionário..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select
                value={filters.department || 'all'}
                onValueChange={handleDepartmentChange}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Departamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="score">Produtividade</SelectItem>
                  <SelectItem value="active_time">Tempo Ativo</SelectItem>
                  <SelectItem value="name">Nome</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="icon" onClick={toggleSortOrder}>
                <ArrowUpDown className="h-4 w-4" />
              </Button>

              <DateRangePicker onChange={handleDateRangeChange} />

              <Button variant="ghost" onClick={handleClearFilters}>
                <Filter className="h-4 w-4 mr-2" />
                Limpar
              </Button>
            </div>

            <ProductivityTable employees={filteredEmployees} isLoading={isLoading} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
