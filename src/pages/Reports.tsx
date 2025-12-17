import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileDown, Users, TrendingUp, ShieldAlert, Ban, RefreshCw } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { subDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { DateRangePicker } from '@/components/DateRangePicker';
import { AlertsChart } from '@/components/AlertsChart';
import { ProductivityChart } from '@/components/ProductivityChart';
import { departments, generateMockReportData } from '@/data/reportData';
import { generatePDF } from '@/utils/pdfExport';
import { cn } from '@/lib/utils';

export default function Reports() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });
  const [selectedDepartment, setSelectedDepartment] = useState('Todos');
  const [isLoading, setIsLoading] = useState(false);

  const reportData = generateMockReportData(
    dateRange?.from || new Date(),
    dateRange?.to || new Date(),
    selectedDepartment
  );

  const handleExportPDF = () => {
    setIsLoading(true);
    try {
      generatePDF(reportData);
      toast.success('Relatório exportado com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar relatório');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    toast.success('Dados atualizados!');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center gap-4 px-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/')}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Relatórios</h1>
            <p className="text-sm text-muted-foreground">Análise detalhada de segurança e produtividade</p>
          </div>
          <Button onClick={handleExportPDF} disabled={isLoading} className="gap-2">
            <FileDown className="h-4 w-4" />
            Exportar PDF
          </Button>
        </div>
      </header>

      <main className="container px-4 py-6 space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4">
            <DateRangePicker date={dateRange} onDateChange={setDateRange} />
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Departamento" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Colaboradores</p>
                <p className="text-2xl font-bold">{reportData.summary.totalEmployees}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/20">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Produtividade</p>
                <p className="text-2xl font-bold">{reportData.summary.avgProductivity}%</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/20">
                <ShieldAlert className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Alertas</p>
                <p className="text-2xl font-bold">{reportData.summary.totalAlerts}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/20">
                <Ban className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bloqueios</p>
                <p className="text-2xl font-bold">{reportData.summary.blockedAttempts}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Alerts by Type */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-lg font-semibold mb-4">Alertas por Tipo</h3>
            <AlertsChart data={reportData.alertsByType} />
          </div>

          {/* Productivity by Department */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-lg font-semibold mb-4">Produtividade por Departamento</h3>
            <ProductivityChart data={reportData.productivityByDepartment} />
          </div>
        </div>

        {/* Top Alert Employees */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">Colaboradores com Mais Alertas</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Posição</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Colaborador</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Departamento</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Alertas</th>
                </tr>
              </thead>
              <tbody>
                {reportData.topAlertEmployees.map((employee, index) => (
                  <tr key={employee.name} className="border-b border-border/50 hover:bg-accent/50 transition-colors">
                    <td className="py-3 px-4">
                      <span className={cn(
                        'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold',
                        index === 0 ? 'bg-destructive/20 text-destructive' :
                        index === 1 ? 'bg-warning/20 text-warning' :
                        index === 2 ? 'bg-orange-500/20 text-orange-500' :
                        'bg-muted text-muted-foreground'
                      )}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium">{employee.name}</td>
                    <td className="py-3 px-4 text-muted-foreground">{employee.department}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center rounded-full bg-destructive/20 px-2 py-1 text-xs font-medium text-destructive">
                        {employee.alerts}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Productivity Table */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">Detalhamento por Departamento</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Departamento</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Colaboradores</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Produtividade</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {reportData.productivityByDepartment.map((dept) => (
                  <tr key={dept.department} className="border-b border-border/50 hover:bg-accent/50 transition-colors">
                    <td className="py-3 px-4 font-medium">{dept.department}</td>
                    <td className="py-3 px-4 text-center">{dept.employees}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
                          <div 
                            className={cn(
                              'h-full rounded-full',
                              dept.score >= 85 ? 'bg-success' :
                              dept.score >= 70 ? 'bg-warning' :
                              'bg-destructive'
                            )}
                            style={{ width: `${dept.score}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{dept.score}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={cn(
                        'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
                        dept.score >= 85 ? 'bg-success/20 text-success' :
                        dept.score >= 70 ? 'bg-warning/20 text-warning' :
                        'bg-destructive/20 text-destructive'
                      )}>
                        {dept.score >= 85 ? 'Excelente' : dept.score >= 70 ? 'Regular' : 'Atenção'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
