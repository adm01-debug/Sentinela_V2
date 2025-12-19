import { memo, useMemo } from 'react';
import { User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  email?: string | null;
  size?: AvatarSize;
  className?: string;
  showStatus?: boolean;
  isOnline?: boolean;
}

// ============================================================
// SIZE CONFIGS
// ============================================================

const sizeClasses: Record<AvatarSize, string> = {
  xs: 'h-6 w-6 text-xs',
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-base',
  lg: 'h-12 w-12 text-lg',
  xl: 'h-16 w-16 text-xl',
};

const statusSizeClasses: Record<AvatarSize, string> = {
  xs: 'h-1.5 w-1.5 -bottom-0 -right-0',
  sm: 'h-2 w-2 -bottom-0 -right-0',
  md: 'h-2.5 w-2.5 -bottom-0.5 -right-0.5',
  lg: 'h-3 w-3 -bottom-0.5 -right-0.5',
  xl: 'h-4 w-4 -bottom-1 -right-1',
};

// ============================================================
// HELPERS
// ============================================================

function getInitials(name?: string | null, email?: string | null): string {
  if (name) {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
  if (email) {
    return email.substring(0, 2).toUpperCase();
  }
  return 'U';
}

function getColorFromString(str: string): string {
  // Generate consistent color based on string
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const colors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-amber-500',
    'bg-yellow-500',
    'bg-lime-500',
    'bg-green-500',
    'bg-emerald-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-sky-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-violet-500',
    'bg-purple-500',
    'bg-fuchsia-500',
    'bg-pink-500',
    'bg-rose-500',
  ];

  return colors[Math.abs(hash) % colors.length];
}

// ============================================================
// COMPONENT
// ============================================================

function UserAvatarComponent({
  src,
  name,
  email,
  size = 'md',
  className,
  showStatus = false,
  isOnline = false,
}: UserAvatarProps) {
  const initials = useMemo(() => getInitials(name, email), [name, email]);
  const bgColor = useMemo(
    () => getColorFromString(name || email || 'user'),
    [name, email]
  );

  return (
    <div className="relative inline-block">
      <Avatar className={cn(sizeClasses[size], className)}>
        {src && <AvatarImage src={src} alt={name || 'Avatar'} />}
        <AvatarFallback className={cn(bgColor, 'text-white font-medium')}>
          {initials || <User className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>
      {showStatus && (
        <span
          className={cn(
            'absolute rounded-full border-2 border-background',
            statusSizeClasses[size],
            isOnline ? 'bg-green-500' : 'bg-gray-400'
          )}
        />
      )}
    </div>
  );
}

export const UserAvatar = memo(UserAvatarComponent);

// ============================================================
// AVATAR GROUP
// ============================================================

interface AvatarGroupProps {
  users: Array<{
    id: string;
    src?: string | null;
    name?: string | null;
    email?: string | null;
  }>;
  max?: number;
  size?: AvatarSize;
  className?: string;
}

function AvatarGroupComponent({
  users,
  max = 4,
  size = 'sm',
  className,
}: AvatarGroupProps) {
  const visibleUsers = users.slice(0, max);
  const remainingCount = users.length - max;

  return (
    <div className={cn('flex -space-x-2', className)}>
      {visibleUsers.map((user) => (
        <UserAvatar
          key={user.id}
          src={user.src}
          name={user.name}
          email={user.email}
          size={size}
          className="ring-2 ring-background"
        />
      ))}
      {remainingCount > 0 && (
        <div
          className={cn(
            'flex items-center justify-center rounded-full bg-muted text-muted-foreground font-medium ring-2 ring-background',
            sizeClasses[size]
          )}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
}

export const AvatarGroup = memo(AvatarGroupComponent);

// ============================================================
// AVATAR WITH NAME
// ============================================================

interface AvatarWithNameProps extends UserAvatarProps {
  subtitle?: string;
}

function AvatarWithNameComponent({
  name,
  email,
  subtitle,
  ...avatarProps
}: AvatarWithNameProps) {
  return (
    <div className="flex items-center gap-3">
      <UserAvatar name={name} email={email} {...avatarProps} />
      <div className="min-w-0">
        <p className="text-sm font-medium truncate">{name || email}</p>
        {(subtitle || (name && email)) && (
          <p className="text-xs text-muted-foreground truncate">
            {subtitle || email}
          </p>
        )}
      </div>
    </div>
  );
}

export const AvatarWithName = memo(AvatarWithNameComponent);
