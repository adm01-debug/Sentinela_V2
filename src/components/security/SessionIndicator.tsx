import { memo, useState, useEffect, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Shield, LogOut, Clock, MapPin, Monitor, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// ============================================================
// TYPES
// ============================================================

interface SessionInfo {
  id: string;
  userId: string;
  email: string;
  startedAt: Date;
  lastActivityAt: Date;
  expiresAt: Date;
  ipAddress?: string;
  location?: string;
  device?: string;
  browser?: string;
  isCurrentSession?: boolean;
}

interface SessionIndicatorProps {
  session: SessionInfo;
  onLogout?: () => void;
  onExtend?: () => void;
  showDetails?: boolean;
  variant?: 'compact' | 'full';
  className?: string;
}

// ============================================================
// SESSION STATUS
// ============================================================

type SessionStatus = 'active' | 'idle' | 'expiring' | 'expired';

function getSessionStatus(session: SessionInfo): SessionStatus {
  const now = new Date();
  const expiresAt = new Date(session.expiresAt);
  const lastActivity = new Date(session.lastActivityAt);
  
  if (now > expiresAt) return 'expired';
  
  const timeToExpire = expiresAt.getTime() - now.getTime();
  if (timeToExpire < 5 * 60 * 1000) return 'expiring'; // Less than 5 minutes
  
  const idleTime = now.getTime() - lastActivity.getTime();
  if (idleTime > 10 * 60 * 1000) return 'idle'; // More than 10 minutes idle
  
  return 'active';
}

const statusConfig = {
  active: {
    color: 'bg-success',
    pulseColor: 'bg-success',
    label: 'Ativo',
    textColor: 'text-success',
  },
  idle: {
    color: 'bg-warning',
    pulseColor: 'bg-warning',
    label: 'Inativo',
    textColor: 'text-warning',
  },
  expiring: {
    color: 'bg-destructive',
    pulseColor: 'bg-destructive',
    label: 'Expirando',
    textColor: 'text-destructive',
  },
  expired: {
    color: 'bg-muted',
    pulseColor: 'bg-muted',
    label: 'Expirado',
    textColor: 'text-muted-foreground',
  },
};

// ============================================================
// STATUS DOT
// ============================================================

interface StatusDotProps {
  status: SessionStatus;
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
}

const StatusDot = memo(function StatusDot({
  status,
  size = 'md',
  pulse = true,
}: StatusDotProps) {
  const config = statusConfig[status];
  const sizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-2.5 w-2.5',
    lg: 'h-3 w-3',
  };

  return (
    <span className="relative flex">
      {pulse && (status === 'active' || status === 'expiring') && (
        <span
          className={cn(
            'absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping',
            config.pulseColor
          )}
        />
      )}
      <span
        className={cn(
          'relative inline-flex rounded-full',
          sizeClasses[size],
          config.color
        )}
      />
    </span>
  );
});

// ============================================================
// COMPACT INDICATOR
// ============================================================

interface CompactIndicatorProps {
  session: SessionInfo;
  status: SessionStatus;
  onClick?: () => void;
}

const CompactIndicator = memo(function CompactIndicator({
  session,
  status,
  onClick,
}: CompactIndicatorProps) {
  const config = statusConfig[status];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-muted/50 transition-colors"
        >
          <StatusDot status={status} size="sm" />
          <span className="text-xs text-muted-foreground hidden sm:inline">
            {config.label}
          </span>
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <div className="text-xs">
          <div className="font-medium">{session.email}</div>
          <div className="text-muted-foreground">
            Sessão {config.label.toLowerCase()}
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
});

// ============================================================
// SESSION DETAILS PANEL
// ============================================================

interface SessionDetailsPanelProps {
  session: SessionInfo;
  status: SessionStatus;
  onLogout?: () => void;
  onExtend?: () => void;
}

const SessionDetailsPanel = memo(function SessionDetailsPanel({
  session,
  status,
  onLogout,
  onExtend,
}: SessionDetailsPanelProps) {
  const config = statusConfig[status];
  const startedAt = new Date(session.startedAt);
  const lastActivityAt = new Date(session.lastActivityAt);
  const expiresAt = new Date(session.expiresAt);

  const sessionDuration = formatDistanceToNow(startedAt, {
    locale: ptBR,
  });

  const lastActivity = formatDistanceToNow(lastActivityAt, {
    addSuffix: true,
    locale: ptBR,
  });

  const expiresIn = formatDistanceToNow(expiresAt, {
    addSuffix: false,
    locale: ptBR,
  });

  return (
    <div className="space-y-4 w-72">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="font-medium text-sm">{session.email}</div>
            <div className="flex items-center gap-1.5">
              <StatusDot status={status} size="sm" pulse={false} />
              <span className={cn('text-xs', config.textColor)}>
                {config.label}
              </span>
            </div>
          </div>
        </div>
        {session.isCurrentSession && (
          <Badge variant="outline" className="text-xs">Atual</Badge>
        )}
      </div>

      {/* Warning for expiring session */}
      {status === 'expiring' && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-destructive/10 text-destructive text-xs">
          <AlertTriangle className="h-4 w-4" />
          <span>Sessão expira em {expiresIn}</span>
        </div>
      )}

      {/* Session Info */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Ativa há {sessionDuration}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Última atividade {lastActivity}</span>
        </div>
        {session.device && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Monitor className="h-4 w-4" />
            <span>{session.device}</span>
          </div>
        )}
        {session.location && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{session.location}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t">
        {status === 'expiring' && onExtend && (
          <Button size="sm" className="flex-1" onClick={onExtend}>
            Estender sessão
          </Button>
        )}
        {onLogout && (
          <Button
            variant={status === 'expiring' ? 'outline' : 'destructive'}
            size="sm"
            className="flex-1"
            onClick={onLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Encerrar
          </Button>
        )}
      </div>
    </div>
  );
});

// ============================================================
// MAIN COMPONENT
// ============================================================

function SessionIndicatorComponent({
  session,
  onLogout,
  onExtend,
  showDetails = true,
  variant = 'compact',
  className,
}: SessionIndicatorProps) {
  const [status, setStatus] = useState<SessionStatus>(() => getSessionStatus(session));

  // Update status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(getSessionStatus(session));
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [session]);

  // Update status when session changes
  useEffect(() => {
    setStatus(getSessionStatus(session));
  }, [session]);

  if (!showDetails) {
    return (
      <div className={cn('flex items-center', className)}>
        <StatusDot status={status} />
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <div className={className}>
            <CompactIndicator session={session} status={status} />
          </div>
        </PopoverTrigger>
        <PopoverContent align="end" className="p-4">
          <SessionDetailsPanel
            session={session}
            status={status}
            onLogout={onLogout}
            onExtend={onExtend}
          />
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <div className={cn('p-4 rounded-lg border bg-card', className)}>
      <SessionDetailsPanel
        session={session}
        status={status}
        onLogout={onLogout}
        onExtend={onExtend}
      />
    </div>
  );
}

export const SessionIndicator = memo(SessionIndicatorComponent);

// ============================================================
// SESSION LIST
// ============================================================

interface SessionListProps {
  sessions: SessionInfo[];
  currentSessionId?: string;
  onLogout?: (sessionId: string) => void;
  onLogoutAll?: () => void;
  className?: string;
}

function SessionListComponent({
  sessions,
  currentSessionId,
  onLogout,
  onLogoutAll,
  className,
}: SessionListProps) {
  const sortedSessions = [...sessions].sort((a, b) => {
    // Current session first
    if (a.id === currentSessionId) return -1;
    if (b.id === currentSessionId) return 1;
    // Then by last activity
    return new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime();
  });

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Sessões ativas</h3>
        {onLogoutAll && sessions.length > 1 && (
          <Button variant="outline" size="sm" onClick={onLogoutAll}>
            Encerrar todas
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {sortedSessions.map((session) => (
          <SessionIndicator
            key={session.id}
            session={{
              ...session,
              isCurrentSession: session.id === currentSessionId,
            }}
            variant="full"
            onLogout={onLogout ? () => onLogout(session.id) : undefined}
          />
        ))}
      </div>
    </div>
  );
}

export const SessionList = memo(SessionListComponent);
