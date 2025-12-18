import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Clock, AlertTriangle, CheckCircle, XCircle, Eye, Bell } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { usePendingNotifications } from '@/hooks/usePendingNotifications';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Shield } from 'lucide-react';

interface NotificationsDropdownProps {
  collapsed?: boolean;
}

export function NotificationsDropdown({ collapsed }: NotificationsDropdownProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { counts } = usePendingNotifications();

  // Fetch pending overtime requests with employee names
  const { data: overtimeRequests = [] } = useQuery({
    queryKey: ['pending-overtime-dropdown'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('overtime_requests')
        .select(`
          id,
          requested_date,
          start_time,
          end_time,
          reason,
          created_at,
          employee_id
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      // Fetch employee names
      const employeeIds = [...new Set(data?.map(r => r.employee_id) || [])];
      const { data: employees } = await supabase
        .from('employees')
        .select('id, name')
        .in('id', employeeIds);

      const employeeMap = new Map(employees?.map(e => [e.id, e.name]) || []);

      return data?.map(request => ({
        ...request,
        employee_name: employeeMap.get(request.employee_id) || 'Desconhecido'
      })) || [];
    },
    enabled: open,
  });

  // Fetch unread violations
  const { data: violations = [] } = useQuery({
    queryKey: ['unread-violations-dropdown'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('security_violations')
        .select('id, employee_name, policy_name, severity, violation_type, created_at')
        .eq('read', false)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
    enabled: open,
  });

  const handleOvertimeClick = (id: string) => {
    setOpen(false);
    navigate('/work-schedules?tab=overtime');
  };

  const handleViolationClick = (id: string) => {
    setOpen(false);
    navigate('/violations');
  };

  const handleViewAllOvertime = () => {
    setOpen(false);
    navigate('/work-schedules?tab=overtime');
  };

  const handleViewAllViolations = () => {
    setOpen(false);
    navigate('/violations');
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  const formatTime = (time: string) => {
    return time?.slice(0, 5) || '';
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-primary hover:bg-primary/90 transition-colors">
          <Shield className="h-5 w-5 text-primary-foreground" />
          {counts.total > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground animate-pulse">
              {counts.total > 9 ? '9+' : counts.total}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0 bg-popover border-border" 
        align={collapsed ? "start" : "start"}
        sideOffset={8}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <h4 className="font-semibold">Notificações</h4>
          </div>
          {counts.total > 0 && (
            <Badge variant="secondary" className="bg-destructive/20 text-destructive">
              {counts.total} pendente{counts.total > 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        <ScrollArea className="max-h-[400px]">
          {/* Overtime Requests Section */}
          {counts.overtimeRequests > 0 && (
            <div>
              <div className="flex items-center justify-between px-4 py-2 bg-muted/50">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-medium">Solicitações de Hora Extra</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {counts.overtimeRequests}
                </Badge>
              </div>
              <div className="p-2 space-y-1">
                {overtimeRequests.map((request) => (
                  <button
                    key={request.id}
                    onClick={() => handleOvertimeClick(request.id)}
                    className="w-full p-2 rounded-lg hover:bg-accent text-left transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{request.employee_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(request.requested_date), "dd/MM", { locale: ptBR })} • {formatTime(request.start_time)} - {formatTime(request.end_time)}
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30 text-xs shrink-0">
                        Pendente
                      </Badge>
                    </div>
                  </button>
                ))}
                {counts.overtimeRequests > 5 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs text-muted-foreground hover:text-foreground"
                    onClick={handleViewAllOvertime}
                  >
                    Ver todas ({counts.overtimeRequests})
                  </Button>
                )}
              </div>
            </div>
          )}

          {counts.overtimeRequests > 0 && counts.unreadViolations > 0 && (
            <Separator />
          )}

          {/* Violations Section */}
          {counts.unreadViolations > 0 && (
            <div>
              <div className="flex items-center justify-between px-4 py-2 bg-muted/50">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium">Violações Não Lidas</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {counts.unreadViolations}
                </Badge>
              </div>
              <div className="p-2 space-y-1">
                {violations.map((violation) => (
                  <button
                    key={violation.id}
                    onClick={() => handleViolationClick(violation.id)}
                    className="w-full p-2 rounded-lg hover:bg-accent text-left transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{violation.employee_name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {violation.policy_name}
                        </p>
                      </div>
                      <Badge variant="outline" className={cn("text-xs shrink-0", getSeverityColor(violation.severity))}>
                        {violation.severity}
                      </Badge>
                    </div>
                  </button>
                ))}
                {counts.unreadViolations > 5 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs text-muted-foreground hover:text-foreground"
                    onClick={handleViewAllViolations}
                  >
                    Ver todas ({counts.unreadViolations})
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Empty State */}
          {counts.total === 0 && (
            <div className="p-8 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="text-sm font-medium">Tudo em dia!</p>
              <p className="text-xs text-muted-foreground mt-1">
                Nenhuma notificação pendente
              </p>
            </div>
          )}
        </ScrollArea>

        {counts.total > 0 && (
          <div className="p-2 border-t border-border">
            <div className="flex gap-2">
              {counts.overtimeRequests > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={handleViewAllOvertime}
                >
                  <Clock className="h-3 w-3 mr-1" />
                  Hora Extra
                </Button>
              )}
              {counts.unreadViolations > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={handleViewAllViolations}
                >
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Violações
                </Button>
              )}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
