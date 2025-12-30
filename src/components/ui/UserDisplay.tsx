import React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// ============================================
// USER AVATAR WITH STATUS
// ============================================

interface UserAvatarProps {
  user: {
    name: string;
    email?: string;
    avatar?: string;
  };
  status?: 'online' | 'offline' | 'busy' | 'away';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showStatus?: boolean;
  className?: string;
}

export function UserAvatar({
  user,
  status,
  size = 'md',
  showStatus = true,
  className,
}: UserAvatarProps) {
  const sizeStyles = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
    xl: 'h-14 w-14',
  };

  const statusSizes = {
    sm: 'h-2 w-2 border',
    md: 'h-2.5 w-2.5 border-2',
    lg: 'h-3 w-3 border-2',
    xl: 'h-4 w-4 border-2',
  };

  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-muted-foreground',
    busy: 'bg-red-500',
    away: 'bg-yellow-500',
  };

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn('relative inline-block', className)}>
            <Avatar className={sizeStyles[size]}>
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-xs font-medium">{initials}</AvatarFallback>
            </Avatar>
            {showStatus && status && (
              <span
                className={cn(
                  'absolute bottom-0 right-0 rounded-full border-background',
                  statusSizes[size],
                  statusColors[status]
                )}
              />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">{user.name}</p>
          {user.email && <p className="text-xs text-muted-foreground">{user.email}</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ============================================
// AVATAR GROUP
// ============================================

interface AvatarGroupProps {
  users: Array<{
    name: string;
    avatar?: string;
  }>;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function AvatarGroup({
  users,
  max = 4,
  size = 'md',
  className,
}: AvatarGroupProps) {
  const displayUsers = users.slice(0, max);
  const remaining = users.length - max;

  const sizeStyles = {
    sm: 'h-6 w-6 text-[10px] -ml-1.5',
    md: 'h-8 w-8 text-xs -ml-2',
    lg: 'h-10 w-10 text-sm -ml-2.5',
  };

  return (
    <div className={cn('flex items-center', className)}>
      {displayUsers.map((user, i) => (
        <TooltipProvider key={i}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Avatar
                className={cn(
                  'border-2 border-background ring-0',
                  sizeStyles[size],
                  i === 0 && 'ml-0'
                )}
              >
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>
                  {user.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <p>{user.name}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
      {remaining > 0 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Avatar className={cn('border-2 border-background', sizeStyles[size])}>
                <AvatarFallback className="bg-muted text-muted-foreground font-medium">
                  +{remaining}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <p>+{remaining} mais</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}

// ============================================
// USER CARD
// ============================================

interface UserCardProps {
  user: {
    name: string;
    email?: string;
    avatar?: string;
    role?: string;
    department?: string;
  };
  status?: 'online' | 'offline' | 'busy' | 'away';
  variant?: 'default' | 'compact' | 'inline';
  showStatus?: boolean;
  onClick?: () => void;
  className?: string;
}

export function UserCard({
  user,
  status,
  variant = 'default',
  showStatus = true,
  onClick,
  className,
}: UserCardProps) {
  if (variant === 'inline') {
    return (
      <div
        className={cn(
          'flex items-center gap-2',
          onClick && 'cursor-pointer hover:opacity-80',
          className
        )}
        onClick={onClick}
      >
        <UserAvatar user={user} status={status} size="sm" showStatus={showStatus} />
        <span className="text-sm font-medium truncate">{user.name}</span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'flex items-center gap-3 p-2 rounded-lg',
          onClick && 'cursor-pointer hover:bg-muted/50 transition-colors',
          className
        )}
        onClick={onClick}
      >
        <UserAvatar user={user} status={status} size="md" showStatus={showStatus} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{user.name}</p>
          {user.email && (
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-start gap-4 p-4 rounded-lg border bg-card',
        onClick && 'cursor-pointer hover:border-primary/50 transition-colors',
        className
      )}
      onClick={onClick}
    >
      <UserAvatar user={user} status={status} size="lg" showStatus={showStatus} />
      <div className="flex-1 min-w-0 space-y-1">
        <p className="font-medium">{user.name}</p>
        {user.email && (
          <p className="text-sm text-muted-foreground truncate">{user.email}</p>
        )}
        <div className="flex items-center gap-2 mt-2">
          {user.role && (
            <Badge variant="secondary" className="text-xs">
              {user.role}
            </Badge>
          )}
          {user.department && (
            <Badge variant="outline" className="text-xs">
              {user.department}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// USER LIST ITEM
// ============================================

interface UserListItemProps {
  user: {
    name: string;
    email?: string;
    avatar?: string;
  };
  status?: 'online' | 'offline' | 'busy' | 'away';
  subtitle?: string;
  trailing?: React.ReactNode;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
}

export function UserListItem({
  user,
  status,
  subtitle,
  trailing,
  onClick,
  selected = false,
  className,
}: UserListItemProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg transition-colors',
        onClick && 'cursor-pointer hover:bg-muted/50',
        selected && 'bg-primary/10 border border-primary/20',
        className
      )}
      onClick={onClick}
    >
      <UserAvatar user={user} status={status} size="md" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{user.name}</p>
        {(subtitle || user.email) && (
          <p className="text-xs text-muted-foreground truncate">
            {subtitle || user.email}
          </p>
        )}
      </div>
      {trailing && <div className="shrink-0">{trailing}</div>}
    </div>
  );
}

export default {
  UserAvatar,
  AvatarGroup,
  UserCard,
  UserListItem,
};
