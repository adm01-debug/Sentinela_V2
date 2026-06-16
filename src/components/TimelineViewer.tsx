import { memo, useMemo } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  LucideIcon,
  Circle,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// ============================================================
// TYPES
// ============================================================

type TimelineStatus = "pending" | "in_progress" | "completed" | "failed" | "warning" | "info";

interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  timestamp: Date | string;
  status?: TimelineStatus;
  icon?: LucideIcon;
  iconColor?: string;
  user?: {
    name: string;
    avatar?: string;
  };
  metadata?: Record<string, string | number>;
  actions?: {
    label: string;
    onClick: () => void;
  }[];
}

interface TimelineViewerProps {
  events: TimelineEvent[];
  title?: string;
  subtitle?: string;
  variant?: "default" | "compact" | "detailed";
  showConnector?: boolean;
  maxItems?: number;
  emptyMessage?: string;
  onLoadMore?: () => void;
  hasMore?: boolean;
  className?: string;
}

// ============================================================
// STATUS CONFIG
// ============================================================

const statusConfig: Record<TimelineStatus, { icon: LucideIcon; color: string; bgColor: string }> = {
  pending: {
    icon: Clock,
    color: "text-muted-foreground",
    bgColor: "bg-muted",
  },
  in_progress: {
    icon: Circle,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  completed: {
    icon: CheckCircle2,
    color: "text-success",
    bgColor: "bg-success/10",
  },
  failed: {
    icon: XCircle,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
  },
  warning: {
    icon: AlertCircle,
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  info: {
    icon: Circle,
    color: "text-info",
    bgColor: "bg-info/10",
  },
};

// ============================================================
// TIMELINE EVENT COMPONENT
// ============================================================

interface TimelineEventItemProps {
  event: TimelineEvent;
  isLast: boolean;
  showConnector: boolean;
  variant: "default" | "compact" | "detailed";
}

const TimelineEventItem = memo(function TimelineEventItem({
  event,
  isLast,
  showConnector,
  variant,
}: TimelineEventItemProps) {
  const timestamp =
    typeof event.timestamp === "string" ? new Date(event.timestamp) : event.timestamp;

  const status = event.status || "info";
  const config = statusConfig[status];
  const Icon = event.icon || config.icon;

  const relativeTime = formatDistanceToNow(timestamp, {
    addSuffix: true,
    locale: ptBR,
  });

  const fullTime = format(timestamp, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR });

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-3 py-2">
        <div
          className={cn(
            "h-2 w-2 flex-shrink-0 rounded-full",
            config.bgColor,
            config.color.replace("text-", "bg-")
          )}
        />
        <div className="min-w-0 flex-1">
          <span className="truncate text-sm">{event.title}</span>
        </div>
        <Tooltip>
          <TooltipTrigger>
            <span className="text-xs text-muted-foreground">{relativeTime}</span>
          </TooltipTrigger>
          <TooltipContent>{fullTime}</TooltipContent>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="relative flex gap-4">
      {/* Connector Line */}
      {showConnector && !isLast && (
        <div className="absolute bottom-0 left-5 top-10 w-px bg-border" />
      )}

      {/* Icon */}
      <div
        className={cn(
          "relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full",
          config.bgColor
        )}
      >
        <Icon className={cn("h-5 w-5", config.color)} />
      </div>

      {/* Content */}
      <div className={cn("flex-1 pb-6", isLast && "pb-0")}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-sm font-medium">{event.title}</h4>
              {status !== "info" && (
                <Badge variant="outline" className={cn("text-xs", config.color)}>
                  {status === "pending" && "Pendente"}
                  {status === "in_progress" && "Em andamento"}
                  {status === "completed" && "Concluído"}
                  {status === "failed" && "Falhou"}
                  {status === "warning" && "Atenção"}
                </Badge>
              )}
            </div>

            {event.description && (
              <p className="mt-1 text-sm text-muted-foreground">{event.description}</p>
            )}

            {/* User & Time */}
            <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
              {event.user && (
                <div className="flex items-center gap-1.5">
                  {event.user.avatar ? (
                    <img
                      src={event.user.avatar}
                      alt={event.user.name}
                      className="h-4 w-4 rounded-full"
                    />
                  ) : (
                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-muted text-[10px] font-medium">
                      {event.user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span>{event.user.name}</span>
                </div>
              )}
              <Tooltip>
                <TooltipTrigger>
                  <span>{relativeTime}</span>
                </TooltipTrigger>
                <TooltipContent>{fullTime}</TooltipContent>
              </Tooltip>
            </div>

            {/* Metadata (detailed variant) */}
            {variant === "detailed" && event.metadata && (
              <div className="mt-3 flex flex-wrap gap-2">
                {Object.entries(event.metadata).map(([key, value]) => (
                  <Badge key={key} variant="secondary" className="text-xs">
                    <span className="mr-1 text-muted-foreground">{key}:</span>
                    {value}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          {event.actions && event.actions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {event.actions.map((action, index) => (
                  <DropdownMenuItem key={index} onClick={action.onClick}>
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  );
});

// ============================================================
// MAIN COMPONENT
// ============================================================

function TimelineViewerComponent({
  events,
  title,
  subtitle,
  variant = "default",
  showConnector = true,
  maxItems,
  emptyMessage = "Nenhum evento encontrado",
  onLoadMore,
  hasMore = false,
  className,
}: TimelineViewerProps) {
  const displayEvents = useMemo(() => {
    if (maxItems) {
      return events.slice(0, maxItems);
    }
    return events;
  }, [events, maxItems]);

  const content = (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      {(title || subtitle) && (
        <div className="flex items-center justify-between">
          <div>
            {title && <h3 className="text-lg font-semibold">{title}</h3>}
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          <Badge variant="secondary">{events.length} eventos</Badge>
        </div>
      )}

      {/* Events */}
      {displayEvents.length > 0 ? (
        <div className={cn(variant === "compact" && "divide-y")}>
          {displayEvents.map((event, index) => (
            <TimelineEventItem
              key={event.id}
              event={event}
              isLast={index === displayEvents.length - 1}
              showConnector={showConnector && variant !== "compact"}
              variant={variant}
            />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <Circle className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </div>
      )}

      {/* Load More */}
      {hasMore && onLoadMore && (
        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={onLoadMore}>
            Carregar mais
          </Button>
        </div>
      )}
    </div>
  );

  if (title || subtitle) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">{content}</CardContent>
      </Card>
    );
  }

  return content;
}

export const TimelineViewer = memo(TimelineViewerComponent);

// ============================================================
// MINI TIMELINE (for dashboard cards)
// ============================================================

interface MiniTimelineProps {
  events: TimelineEvent[];
  maxItems?: number;
  className?: string;
}

function MiniTimelineComponent({ events, maxItems = 5, className }: MiniTimelineProps) {
  return (
    <TimelineViewer
      events={events}
      variant="compact"
      maxItems={maxItems}
      showConnector={false}
      className={className}
    />
  );
}

export const MiniTimeline = memo(MiniTimelineComponent);
