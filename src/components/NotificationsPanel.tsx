import { useState } from "react";
import { Bell, Check, CheckCheck, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  useSecurityViolations,
  SecurityViolation,
  useUpdateViolationStatus,
} from "@/hooks/useSecurityViolations";

const severityConfig = {
  low: {
    icon: Info,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    label: "Baixa",
  },
  medium: {
    icon: AlertTriangle,
    color: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/30",
    label: "Média",
  },
  high: {
    icon: AlertCircle,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    label: "Alta",
  },
  critical: {
    icon: AlertCircle,
    color: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/30",
    label: "Crítica",
  },
};

function ViolationItem({
  violation,
  onMarkAsRead,
}: {
  violation: SecurityViolation;
  onMarkAsRead: (id: string) => void;
}) {
  const config = severityConfig[violation.severity] || severityConfig.medium;
  const Icon = config.icon;
  const isRead = violation.status !== "open";

  return (
    <div
      className={cn(
        "border-border border-b p-3 transition-colors last:border-b-0",
        !isRead && "bg-primary/5"
      )}
    >
      <div className="flex gap-3">
        <div className={cn("shrink-0 rounded-lg p-2", config.bg)}>
          <Icon className={cn("h-4 w-4", config.color)} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate text-sm font-medium">{violation.violation_type}</p>
            <Badge
              variant="outline"
              className={cn("shrink-0 text-xs", config.color, config.border)}
            >
              {config.label}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-0.5 text-sm">
            {violation.employee_name || "Unknown"} - {violation.violation_type}
          </p>
          {violation.description && (
            <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
              {violation.description}
            </p>
          )}
          <div className="mt-2 flex items-center justify-between">
            <span className="text-muted-foreground text-xs">
              {formatDistanceToNow(new Date(violation.created_at), {
                addSuffix: true,
                locale: ptBR,
              })}
            </span>
            {!isRead && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={() => onMarkAsRead(violation.id)}
              >
                <Check className="mr-1 h-3 w-3" />
                Marcar como lida
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function NotificationsPanel() {
  const [open, setOpen] = useState(false);
  const { data: violations = [], isLoading } = useSecurityViolations();
  const updateStatus = useUpdateViolationStatus();

  const unreadCount = violations.filter((v) => v.status === "open").length;

  const handleMarkAsRead = (id: string) => {
    updateStatus.mutate({ id, status: "acknowledged" });
  };

  const handleMarkAllAsRead = () => {
    violations
      .filter((v) => v.status === "open")
      .forEach((v) => updateStatus.mutate({ id: v.id, status: "acknowledged" }));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="bg-destructive text-destructive-foreground absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="border-border flex items-center justify-between border-b p-4">
          <div>
            <h3 className="font-semibold">Notificações</h3>
            <p className="text-muted-foreground text-sm">
              {unreadCount > 0 ? `${unreadCount} não lidas` : "Todas lidas"}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
              <CheckCheck className="mr-1 h-4 w-4" />
              Marcar todas
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="text-muted-foreground p-8 text-center">Carregando...</div>
          ) : violations.length === 0 ? (
            <div className="text-muted-foreground p-8 text-center">
              <Bell className="mx-auto mb-2 h-12 w-12 opacity-20" />
              <p>Nenhuma notificação</p>
            </div>
          ) : (
            violations.map((violation: SecurityViolation) => (
              <ViolationItem
                key={violation.id}
                violation={violation}
                onMarkAsRead={handleMarkAsRead}
              />
            ))
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
