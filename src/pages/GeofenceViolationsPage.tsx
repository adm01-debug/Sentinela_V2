import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Search, 
  MapPin, 
  Smartphone, 
  Calendar as CalendarIcon, 
  Filter, 
  Download,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { useGeofenceViolations } from '@/hooks/useGeofenceViolations';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DateRangePicker } from '@/components/DateRangePicker';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/EmptyState';
import { generateGeofencePDFReport } from '@/utils/geofenceReport';
import { useToast } from '@/hooks/use-toast';

export default function GeofenceViolationsPage() {
  const { toast } = useToast();
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [deviceFilter, setDeviceFilter] = useState('');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined
  });

  const { data: violations = [], isLoading } = useGeofenceViolations({
    employeeName: employeeFilter || undefined,
    device: deviceFilter || undefined,
    startDate: dateRange.from?.toISOString(),
    endDate: dateRange.to?.toISOString()
  });

  const handleExport = () => {
    if (violations.length === 0) {
      toast({ title: 'Sem dados para exportar', variant: 'destructive' });
      return;
    }
    
    const period = dateRange.from ? 
      `${format(dateRange.from, 'MMMM yyyy', { locale: ptBR })}` : 
      'Geral';
      
    generateGeofencePDFReport(violations as unknown as Parameters<typeof generateGeofencePDFReport>[0], period);
    toast({ title: 'Relatório PDF gerado com sucesso!' });
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Alertas de Geofencing"
        description="Monitoramento em tempo real de violações de cercas geográficas"
        showBackButton={false}
        actions={
          <Button variant="outline" onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        }
      />

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <span className="text-sm font-medium text-muted-foreground">Total de Violações</span>
            </div>
            <p className="text-3xl font-bold mt-2">{violations.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Dispositivos Ativos</span>
            </div>
            <p className="text-3xl font-bold mt-2">
              {new Set(violations.map(v => v.device)).size}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-warning" />
              <span className="text-sm font-medium text-muted-foreground">Zonas com Ocorrências</span>
            </div>
            <p className="text-3xl font-bold mt-2">
              {new Set(violations.map(v => v.nearest_geofence_id)).size}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtros Avançados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Colaborador</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nome do colaborador..."
                  className="pl-8"
                  value={employeeFilter}
                  onChange={(e) => setEmployeeFilter(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Dispositivo</label>
              <div className="relative">
                <Smartphone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Modelo ou ID do dispositivo..."
                  className="pl-8"
                  value={deviceFilter}
                  onChange={(e) => setDeviceFilter(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Período</label>
              <DateRangePicker
                value={dateRange.from && dateRange.to ? { from: dateRange.from, to: dateRange.to } : undefined}
                onChange={(range) => setDateRange({ from: range?.from, to: range?.to })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Violations Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : violations.length === 0 ? (
            <div className="py-12">
              <EmptyState
                icon={MapPin}
                title="Nenhum alerta encontrado"
                description="Nenhuma violação de geofence foi registrada com os filtros aplicados."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Colaborador</TableHead>
                    <TableHead>Dispositivo</TableHead>
                    <TableHead>Localização</TableHead>
                    <TableHead>Distância</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {violations.map((violation) => (
                    <TableRow key={violation.id}>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                          {format(new Date(violation.created_at), "dd/MM/yy HH:mm", { locale: ptBR })}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{violation.employee_name}</TableCell>
                      <TableCell>{violation.device}</TableCell>
                      <TableCell>
                        <div className="max-w-[200px] truncate" title={violation.detected_address}>
                          {violation.detected_address || 'Endereço não detectado'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {violation.distance_meters}m
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={violation.action_taken === 'blocked' ? 'destructive' : 'secondary'}>
                          {violation.action_taken === 'blocked' ? 'Bloqueado' : 'Notificado'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" title="Ver no Mapa">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
