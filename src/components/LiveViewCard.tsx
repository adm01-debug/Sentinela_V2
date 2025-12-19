import { memo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Monitor, RefreshCw, Maximize2, User, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SessionRecording {
  id: string;
  employee_name: string;
  device: string | null;
  screenshot_url: string;
  app_name: string | null;
  window_title: string | null;
  recorded_at: string;
}

export const LiveViewCard = () => {
  const [employees, setEmployees] = useState<string[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [latestScreenshot, setLatestScreenshot] = useState<SessionRecording | null>(null);
  const [loading, setLoading] = useState(false);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);

  // Fetch unique employees
  useEffect(() => {
    const fetchEmployees = async () => {
      const { data } = await supabase
        .from('session_recordings')
        .select('employee_name')
        .order('recorded_at', { ascending: false });
      
      if (data) {
        const unique = [...new Set(data.map(d => d.employee_name))];
        setEmployees(unique);
        if (unique.length > 0 && !selectedEmployee) {
          setSelectedEmployee(unique[0]);
        }
      }
    };
    fetchEmployees();
  }, []);

  // Fetch latest screenshot for selected employee
  const fetchLatestScreenshot = async () => {
    if (!selectedEmployee) return;
    
    setLoading(true);
    const { data } = await supabase
      .from('session_recordings')
      .select('*')
      .eq('employee_name', selectedEmployee)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .single();
    
    if (data) {
      setLatestScreenshot(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLatestScreenshot();
  }, [selectedEmployee]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!selectedEmployee) return;

    const channel = supabase
      .channel('live-view-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'session_recordings',
          filter: `employee_name=eq.${selectedEmployee}`,
        },
        (payload) => {
          setLatestScreenshot(payload.new as SessionRecording);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedEmployee]);

  const timeSinceUpdate = latestScreenshot 
    ? Math.round((Date.now() - new Date(latestScreenshot.recorded_at).getTime()) / 1000)
    : null;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5 text-primary" />
            Live View
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Selecionar funcionário" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp} value={emp}>
                    <span className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {emp}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={fetchLatestScreenshot} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!selectedEmployee ? (
            <div className="flex items-center justify-center h-[400px] bg-muted/50 rounded-lg">
              <p className="text-muted-foreground">Selecione um funcionário para visualizar</p>
            </div>
          ) : !latestScreenshot ? (
            <div className="flex items-center justify-center h-[400px] bg-muted/50 rounded-lg">
              <p className="text-muted-foreground">Nenhuma captura disponível</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative group">
                <img
                  src={latestScreenshot.screenshot_url}
                  alt="Live screenshot"
                  className="w-full h-auto rounded-lg border cursor-pointer"
                  onClick={() => setFullscreenOpen(true)}
                />
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => setFullscreenOpen(true)}
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
                <Badge 
                  variant={timeSinceUpdate && timeSinceUpdate < 30 ? "default" : "secondary"}
                  className="absolute top-2 left-2"
                >
                  <Clock className="h-3 w-3 mr-1" />
                  {timeSinceUpdate !== null ? (
                    timeSinceUpdate < 60 
                      ? `${timeSinceUpdate}s atrás` 
                      : `${Math.round(timeSinceUpdate / 60)}min atrás`
                  ) : 'N/A'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4 text-muted-foreground">
                  <span><strong>App:</strong> {latestScreenshot.app_name || 'N/A'}</span>
                  <span><strong>Janela:</strong> {latestScreenshot.window_title?.substring(0, 50) || 'N/A'}</span>
                </div>
                <span className="text-muted-foreground">
                  {format(new Date(latestScreenshot.recorded_at), "HH:mm:ss", { locale: ptBR })}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={fullscreenOpen} onOpenChange={setFullscreenOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              {selectedEmployee} - Live View
            </DialogTitle>
          </DialogHeader>
          {latestScreenshot && (
            <div className="space-y-2">
              <img
                src={latestScreenshot.screenshot_url}
                alt="Full screen screenshot"
                className="w-full h-auto rounded-lg"
              />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{latestScreenshot.app_name} - {latestScreenshot.window_title}</span>
                <span>{format(new Date(latestScreenshot.recorded_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
