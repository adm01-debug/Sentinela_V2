import { useState, useMemo } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Keyboard, TrendingUp, Monitor, Eye, Settings, Loader2, Activity, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMonitoringSettings } from '@/hooks/useMonitoringSettings';
import { KeystrokeActivityCard } from '@/components/KeystrokeActivityCard';
import { ProductivityCard } from '@/components/ProductivityCard';
import { ScreenCapturesCard } from '@/components/ScreenCapturesCard';
import { MonitoringNotice, EmployeeMonitoringWidget } from '@/components/MonitoringNotice';
import { useRealtimeActivity } from '@/hooks/useRealtimeActivity';
import { ActivityStatsCards } from '@/components/ActivityStatsCards';
import { RealtimeKeystrokesCard } from '@/components/RealtimeKeystrokesCard';
import { RealtimeClicksCard } from '@/components/RealtimeClicksCard';
import { ActivityHeatmap } from '@/components/ActivityHeatmap';
import { RealtimeActivityFilters, RealtimeFilters } from '@/components/RealtimeActivityFilters';

const Monitoring = () => {
  const { settings, loading, updateSetting } = useMonitoringSettings();
  const [showEmployeePreview, setShowEmployeePreview] = useState(false);
  const { keystrokes, clicks, stats, loading: realtimeLoading, refetch } = useRealtimeActivity();
  const [filters, setFilters] = useState<RealtimeFilters>({
    employeeName: '',
    appName: '',
    dateFrom: undefined,
    dateTo: undefined,
  });

  // Extract unique employees and apps for filter options
  const employees = useMemo(() => {
    const employeeSet = new Set<string>();
    keystrokes.forEach((k) => employeeSet.add(k.employee_name));
    clicks.forEach((c) => employeeSet.add(c.employee_name));
    return Array.from(employeeSet).sort();
  }, [keystrokes, clicks]);

  const apps = useMemo(() => {
    const appSet = new Set<string>();
    keystrokes.forEach((k) => k.app_name && appSet.add(k.app_name));
    clicks.forEach((c) => c.app_name && appSet.add(c.app_name));
    return Array.from(appSet).sort();
  }, [keystrokes, clicks]);

  // Filter data
  const filteredKeystrokes = useMemo(() => {
    return keystrokes.filter((k) => {
      if (filters.employeeName && k.employee_name !== filters.employeeName) return false;
      if (filters.appName && k.app_name !== filters.appName) return false;
      if (filters.dateFrom) {
        const recordedDate = new Date(k.recorded_at);
        if (recordedDate < filters.dateFrom) return false;
      }
      if (filters.dateTo) {
        const recordedDate = new Date(k.recorded_at);
        const endOfDay = new Date(filters.dateTo);
        endOfDay.setHours(23, 59, 59, 999);
        if (recordedDate > endOfDay) return false;
      }
      return true;
    });
  }, [keystrokes, filters]);

  const filteredClicks = useMemo(() => {
    return clicks.filter((c) => {
      if (filters.employeeName && c.employee_name !== filters.employeeName) return false;
      if (filters.appName && c.app_name !== filters.appName) return false;
      if (filters.dateFrom) {
        const recordedDate = new Date(c.recorded_at);
        if (recordedDate < filters.dateFrom) return false;
      }
      if (filters.dateTo) {
        const recordedDate = new Date(c.recorded_at);
        const endOfDay = new Date(filters.dateTo);
        endOfDay.setHours(23, 59, 59, 999);
        if (recordedDate > endOfDay) return false;
      }
      return true;
    });
  }, [clicks, filters]);

  // Calculate filtered stats
  const filteredStats = useMemo(() => {
    const activeEmployees = new Set<string>();
    filteredKeystrokes.forEach((k) => activeEmployees.add(k.employee_name));
    filteredClicks.forEach((c) => activeEmployees.add(c.employee_name));
    
    return {
      totalKeystrokes: filteredKeystrokes.length,
      totalClicks: filteredClicks.length,
      activeEmployees,
      keystrokesPerMinute: filteredKeystrokes.length > 0 ? Math.round(filteredKeystrokes.length / 60) : 0,
      clicksPerMinute: filteredClicks.length > 0 ? Math.round(filteredClicks.length / 60) : 0,
    };
  }, [filteredKeystrokes, filteredClicks]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className="pl-64">
          <Header />
          <main className="p-6 flex items-center justify-center min-h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
          <div>
            <h1 className="text-2xl font-bold">Monitoramento</h1>
            <p className="text-muted-foreground">
              Configure e visualize o monitoramento de atividades
            </p>
          </div>

          <MonitoringNotice variant="admin" />

          <Tabs defaultValue="realtime" className="space-y-6">
            <TabsList>
              <TabsTrigger value="realtime" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Tempo Real
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Configurações
              </TabsTrigger>
            </TabsList>

            <TabsContent value="realtime" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Atividade em Tempo Real</h2>
                  <p className="text-sm text-muted-foreground">
                    Visualize cliques e teclas digitadas em tempo real
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refetch}
                  disabled={realtimeLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${realtimeLoading ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
              </div>

              <RealtimeActivityFilters
                filters={filters}
                onFiltersChange={setFilters}
                employees={employees}
                apps={apps}
              />

              <ActivityStatsCards
                totalKeystrokes={filteredStats.totalKeystrokes}
                totalClicks={filteredStats.totalClicks}
                activeEmployeesCount={filteredStats.activeEmployees.size}
                keystrokesPerMinute={filteredStats.keystrokesPerMinute}
                clicksPerMinute={filteredStats.clicksPerMinute}
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RealtimeKeystrokesCard keystrokes={filteredKeystrokes} />
                <RealtimeClicksCard clicks={filteredClicks} />
              </div>

              <ActivityHeatmap keystrokes={filteredKeystrokes} clicks={filteredClicks} />
            </TabsContent>

            <TabsContent value="dashboard" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <KeystrokeActivityCard />
                <ProductivityCard />
              </div>
              <ScreenCapturesCard />
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              {/* Keystroke Monitoring Settings */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Keyboard className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Monitoramento de Teclas</CardTitle>
                        <CardDescription>
                          Registra a quantidade de teclas digitadas e tempo de atividade
                        </CardDescription>
                      </div>
                    </div>
                    <Switch
                      checked={settings.keystroke_monitoring.enabled}
                      onCheckedChange={(checked) =>
                        updateSetting('keystroke_monitoring', {
                          ...settings.keystroke_monitoring,
                          enabled: checked
                        })
                      }
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="keystroke-interval">Intervalo de coleta (segundos)</Label>
                      <Input
                        id="keystroke-interval"
                        type="number"
                        value={settings.keystroke_monitoring.interval_seconds}
                        onChange={(e) =>
                          updateSetting('keystroke_monitoring', {
                            ...settings.keystroke_monitoring,
                            interval_seconds: parseInt(e.target.value) || 60
                          })
                        }
                        className="max-w-[200px]"
                        disabled={!settings.keystroke_monitoring.enabled}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Productivity Tracking Settings */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-500/10">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Conferência de Produtividade</CardTitle>
                        <CardDescription>
                          Analisa tempo produtivo vs improdutivo baseado em aplicativos
                        </CardDescription>
                      </div>
                    </div>
                    <Switch
                      checked={settings.productivity_tracking.enabled}
                      onCheckedChange={(checked) =>
                        updateSetting('productivity_tracking', {
                          ...settings.productivity_tracking,
                          enabled: checked
                        })
                      }
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="work-start">Início do expediente</Label>
                      <Input
                        id="work-start"
                        type="time"
                        value={settings.productivity_tracking.work_hours_start}
                        onChange={(e) =>
                          updateSetting('productivity_tracking', {
                            ...settings.productivity_tracking,
                            work_hours_start: e.target.value
                          })
                        }
                        disabled={!settings.productivity_tracking.enabled}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="work-end">Fim do expediente</Label>
                      <Input
                        id="work-end"
                        type="time"
                        value={settings.productivity_tracking.work_hours_end}
                        onChange={(e) =>
                          updateSetting('productivity_tracking', {
                            ...settings.productivity_tracking,
                            work_hours_end: e.target.value
                          })
                        }
                        disabled={!settings.productivity_tracking.enabled}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Screen Capture Settings */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/10">
                        <Monitor className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Captura de Tela</CardTitle>
                        <CardDescription>
                          Captura screenshots periódicos dos dispositivos monitorados
                        </CardDescription>
                      </div>
                    </div>
                    <Switch
                      checked={settings.screen_capture.enabled}
                      onCheckedChange={(checked) =>
                        updateSetting('screen_capture', {
                          ...settings.screen_capture,
                          enabled: checked
                        })
                      }
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="capture-interval">Intervalo de captura (minutos)</Label>
                      <Input
                        id="capture-interval"
                        type="number"
                        value={settings.screen_capture.interval_minutes}
                        onChange={(e) =>
                          updateSetting('screen_capture', {
                            ...settings.screen_capture,
                            interval_minutes: parseInt(e.target.value) || 5
                          })
                        }
                        className="max-w-[200px]"
                        disabled={!settings.screen_capture.enabled}
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch
                        id="blur-sensitive"
                        checked={settings.screen_capture.blur_sensitive}
                        onCheckedChange={(checked) =>
                          updateSetting('screen_capture', {
                            ...settings.screen_capture,
                            blur_sensitive: checked
                          })
                        }
                        disabled={!settings.screen_capture.enabled}
                      />
                      <Label htmlFor="blur-sensitive">
                        Desfocar áreas sensíveis (senhas, dados bancários)
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Monitoring Notice Settings */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-500/10">
                        <Eye className="h-5 w-5 text-amber-500" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Aviso de Monitoramento</CardTitle>
                        <CardDescription>
                          Exibe notificação ao colaborador sobre o monitoramento
                        </CardDescription>
                      </div>
                    </div>
                    <Switch
                      checked={settings.monitoring_notice.show_notice}
                      onCheckedChange={(checked) =>
                        updateSetting('monitoring_notice', {
                          ...settings.monitoring_notice,
                          show_notice: checked
                        })
                      }
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="notice-text">Texto do aviso</Label>
                      <Textarea
                        id="notice-text"
                        value={settings.monitoring_notice.notice_text}
                        onChange={(e) =>
                          updateSetting('monitoring_notice', {
                            ...settings.monitoring_notice,
                            notice_text: e.target.value
                          })
                        }
                        rows={3}
                        disabled={!settings.monitoring_notice.show_notice}
                      />
                    </div>
                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between mb-3">
                        <Label>Preview do aviso (como o colaborador verá)</Label>
                        <Switch
                          checked={showEmployeePreview}
                          onCheckedChange={setShowEmployeePreview}
                        />
                      </div>
                      {showEmployeePreview && settings.monitoring_notice.show_notice && (
                        <div className="relative bg-muted/30 rounded-lg p-4 min-h-[100px]">
                          <EmployeeMonitoringWidget noticeText={settings.monitoring_notice.notice_text} />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default Monitoring;
