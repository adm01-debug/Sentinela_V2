import { cn } from '@/utils/cn';

interface UserAvatarProps {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-12 w-12 text-base' };

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function getColor(name: string): string {
  const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500'];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

export function UserAvatar({ name, src, size = 'md', className }: UserAvatarProps) {
  if (src) {
    return <img src={src} alt={name} className={cn('rounded-full object-cover', sizes[size], className)} />;
  }

  return (
    <div className={cn('rounded-full flex items-center justify-center text-white font-medium', sizes[size], getColor(name), className)}>
      {getInitials(name)}
    </div>
  );
}
