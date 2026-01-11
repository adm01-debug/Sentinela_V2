import { cn } from '@/utils/cn';

interface AvatarProps { src?: string; alt?: string; fallback?: string; size?: 'sm' | 'md' | 'lg'; className?: string; }

export const Avatar = ({ src, alt, fallback, size = 'md', className }: AvatarProps) => {
  const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-12 w-12 text-base' };
  return (
    <div className={cn('relative flex shrink-0 overflow-hidden rounded-full', sizes[size], className)}>
      {src ? (
        <img src={src} alt={alt} className="aspect-square h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-muted font-medium">
          {fallback || alt?.charAt(0).toUpperCase() || '?'}
        </div>
      )}
    </div>
  );
};