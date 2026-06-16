import React, { useState, useMemo } from "react";
import { formatDistanceToNow, format, isToday, isYesterday, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Activity,
  User,
  Shield,
  AlertTriangle,
  Clock,
  Monitor,
  MousePointer,
  Keyboard,
  MapPin,
  MoreHorizontal,
  Eye,
  Flag,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// Types
export type ActivityType =
  | "login"
  | "logout"
  | "violation"
  | "warning"
  | "screenshot"
  | "keystroke"
  | "click"
  | "location"
  | "idle"
  | "active"
  | "system";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  timestamp: Date;
  user?: {
    name: string;
    avatar?: string;
    email?: string;
  };
  metadata?: unknown;
  severity?: "info" | "warning" | "error" | "success";
  isRead?: boolean;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  maxHeight?: number;
  groupByDate?: boolean;
  showFilters?: boolean;
  onActivityClick?: (activity: ActivityItem) => void;
  onViewDetails?: (activity: ActivityItem) => void;
  onFlag?: (activity: ActivityItem) => void;
  onAddNote?: (activity: ActivityItem) => void;
  className?: string;
  emptyMessage?: string;
  isLoading?: boolean;
}

// Activity type config
const activityConfig: Record<
  ActivityType,
  { icon: React.ElementType; color: string; bgColor: string }
> = {
  login: { icon: User, color: "text-green-600", bgColor: "bg-green-100 dark:bg-green-900/30" },
  logout: { icon: User, color: "text-muted-foreground", bgColor: "bg-muted" },
  violation: { icon: Shield, color: "text-destructive", bgColor: "bg-destructive/10" },
  warning: {
    icon: AlertTriangle,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
  },
  screenshot: { icon: Monitor, color: "text-blue-600", bgColor: "bg-blue-100 dark:bg-blue-900/30" },
  keystroke: {
    icon: Keyboard,
    color: "text-purple-600",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
  },
  click: {
    icon: MousePointer,
    color: "text-indigo-600",
    bgColor: "bg-indigo-100 dark:bg-indigo-900/30",
  },
  location: {
    icon: MapPin,
    color: "text-orange-600",
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
  },
  idle: { icon: Clock, color: "text-muted-foreground", bgColor: "bg-muted" },
  active: { icon: Activity, color: "text-green-600", bgColor: "bg-green-100 dark:bg-green-900/30" },
  system: { icon: Monitor, color: "text-muted-foreground", bgColor: "bg-muted" },
};

// Single activity item component
function ActivityItemCard({
  activity,
  onClick,
  onViewDetails,
  onFlag,
  onAddNote,
}: {
  activity: ActivityItem;
  onClick?: (activity: ActivityItem) => void;
  onViewDetails?: (activity: ActivityItem) => void;
  onFlag?: (activity: ActivityItem) => void;
  onAddNote?: (activity: ActivityItem) => void;
}) {
  const config = activityConfig[activity.type];
  const Icon = config.icon;

  const severityStyles = {
    info: "",
    warning: "border-l-2 border-l-yellow-500",
    error: "border-l-2 border-l-destructive",
    success: "border-l-2 border-l-green-500",
  };

  return (
    <div
      className={cn(
        "group flex items-start gap-3 rounded-lg p-3 transition-all duration-200",
        "cursor-pointer hover:bg-muted/50",
        !activity.isRead && "bg-primary/5",
        activity.severity && severityStyles[activity.severity]
      )}
      role="button"
      tabIndex={0}
      onClick={() => onClick?.(activity)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.(activity);
        }
      }}
    >
      {/* Icon */}
      <div className={cn("shrink-0 rounded-full p-2", config.bgColor)}>
        <Icon className={cn("h-4 w-4", config.color)} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{activity.title}</p>
            {activity.description && (
              <p className="line-clamp-2 text-xs text-muted-foreground">{activity.description}</p>
            )}
          </div>

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewDetails?.(activity)}>
                <Eye className="mr-2 h-4 w-4" />
                Ver detalhes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFlag?.(activity)}>
                <Flag className="mr-2 h-4 w-4" />
                Sinalizar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddNote?.(activity)}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Adicionar nota
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* User and timestamp */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {activity.user && (
            <>
              <Avatar className="h-4 w-4">
                <AvatarImage src={activity.user.avatar} />
                <AvatarFallback className="text-[8px]">
                  {activity.user.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="max-w-[100px] truncate">{activity.user.name}</span>
              <span>•</span>
            </>
          )}
          <span>{formatDistanceToNow(activity.timestamp, { addSuffix: true, locale: ptBR })}</span>
        </div>
      </div>

      {/* Unread indicator */}
      {!activity.isRead && <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />}
    </div>
  );
}

// Loading skeleton
function ActivitySkeleton() {
  return (
    <div className="flex animate-pulse items-start gap-3 p-3">
      <div className="h-8 w-8 rounded-full bg-muted" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-3/4 rounded bg-muted" />
        <div className="h-3 w-1/2 rounded bg-muted" />
      </div>
    </div>
  );
}

// Main component
export function ActivityFeed({
  activities,
  maxHeight = 500,
  groupByDate = true,
  showFilters = true,
  onActivityClick,
  onViewDetails,
  onFlag,
  onAddNote,
  className,
  emptyMessage = "Nenhuma atividade encontrada",
  isLoading = false,
}: ActivityFeedProps) {
  const [typeFilter, setTypeFilter] = useState<ActivityType | "all">("all");
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  // Filter and group activities
  const processedActivities = useMemo(() => {
    let filtered = activities;

    if (typeFilter !== "all") {
      filtered = activities.filter((a) => a.type === typeFilter);
    }

    if (!groupByDate) {
      return { ungrouped: filtered };
    }

    // Group by date
    const groups: Record<string, ActivityItem[]> = {};
    filtered.forEach((activity) => {
      const dateKey = startOfDay(activity.timestamp).toISOString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(activity);
    });

    return groups;
  }, [activities, typeFilter, groupByDate]);

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const uniqueTypes = useMemo(() => {
    const types = new Set(activities.map((a) => a.type));
    return Array.from(types);
  }, [activities]);

  if (isLoading) {
    return (
      <div className={cn("rounded-lg border", className)}>
        {[...Array(5)].map((_, i) => (
          <ActivitySkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("overflow-hidden rounded-lg border", className)}>
      {/* Filters */}
      {showFilters && uniqueTypes.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto border-b p-2">
          <Filter className="h-4 w-4 shrink-0 text-muted-foreground" />
          <Button
            variant={typeFilter === "all" ? "secondary" : "ghost"}
            size="sm"
            className="h-7 shrink-0 text-xs"
            onClick={() => setTypeFilter("all")}
          >
            Todos
          </Button>
          {uniqueTypes.map((type) => {
            const config = activityConfig[type];
            const Icon = config.icon;
            return (
              <Button
                key={type}
                variant={typeFilter === type ? "secondary" : "ghost"}
                size="sm"
                className="h-7 shrink-0 text-xs"
                onClick={() => setTypeFilter(type)}
              >
                <Icon className={cn("mr-1 h-3 w-3", config.color)} />
                {type}
              </Button>
            );
          })}
        </div>
      )}

      {/* Activity list */}
      <ScrollArea style={{ maxHeight }}>
        {Object.keys(processedActivities).length === 0 ||
        (processedActivities.ungrouped && processedActivities.ungrouped.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Activity className="mb-4 h-12 w-12 opacity-20" />
            <p className="text-sm">{emptyMessage}</p>
          </div>
        ) : groupByDate ? (
          Object.entries(processedActivities)
            .filter(([key]) => key !== "ungrouped")
            .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
            .map(([dateKey, items]) => {
              const isExpanded = expandedGroups[dateKey] !== false;
              return (
                <Collapsible
                  key={dateKey}
                  open={isExpanded}
                  onOpenChange={() => toggleGroup(dateKey)}
                >
                  <CollapsibleTrigger asChild>
                    <div className="sticky top-0 z-10 flex cursor-pointer items-center justify-between border-b bg-background/95 px-3 py-2 backdrop-blur-sm hover:bg-muted/50">
                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          {isToday(new Date(dateKey))
                            ? "Hoje"
                            : isYesterday(new Date(dateKey))
                              ? "Ontem"
                              : format(new Date(dateKey), "d 'de' MMMM", { locale: ptBR })}
                        </span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {items.length}
                      </Badge>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="divide-y">
                      {items.map((activity) => (
                        <ActivityItemCard
                          key={activity.id}
                          activity={activity}
                          onClick={onActivityClick}
                          onViewDetails={onViewDetails}
                          onFlag={onFlag}
                          onAddNote={onAddNote}
                        />
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })
        ) : (
          <div className="divide-y">
            {processedActivities.ungrouped?.map((activity) => (
              <ActivityItemCard
                key={activity.id}
                activity={activity}
                onClick={onActivityClick}
                onViewDetails={onViewDetails}
                onFlag={onFlag}
                onAddNote={onAddNote}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

// Compact version
export function MiniActivityFeed({
  activities,
  limit = 5,
  onViewAll,
  className,
}: {
  activities: ActivityItem[];
  limit?: number;
  onViewAll?: () => void;
  className?: string;
}) {
  const recentActivities = activities.slice(0, limit);

  return (
    <div className={cn("space-y-2", className)}>
      {recentActivities.map((activity) => {
        const config = activityConfig[activity.type];
        const Icon = config.icon;

        return (
          <div
            key={activity.id}
            className="flex items-center gap-2 rounded-md p-2 transition-colors hover:bg-muted/50"
          >
            <Icon className={cn("h-4 w-4 shrink-0", config.color)} />
            <span className="flex-1 truncate text-sm">{activity.title}</span>
            <span className="shrink-0 text-xs text-muted-foreground">
              {formatDistanceToNow(activity.timestamp, { addSuffix: true, locale: ptBR })}
            </span>
          </div>
        );
      })}

      {activities.length > limit && onViewAll && (
        <Button variant="ghost" size="sm" className="w-full text-xs" onClick={onViewAll}>
          Ver todas ({activities.length})
        </Button>
      )}
    </div>
  );
}

export default ActivityFeed;
