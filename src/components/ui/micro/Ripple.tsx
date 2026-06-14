import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface RippleProps {
  color?: string;
  duration?: number;
  children: React.ReactNode;
  className?: string;
}

export function Ripple({ color = 'rgba(255,255,255,0.3)', duration = 600, children, className }: RippleProps) {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ripple = { x: e.clientX - rect.left, y: e.clientY - rect.top, id: Date.now() };
    setRipples(prev => [...prev, ripple]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== ripple.id)), duration);
  }, [duration]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const rect = e.currentTarget.getBoundingClientRect();
      const ripple = { x: rect.width / 2, y: rect.height / 2, id: Date.now() };
      setRipples(prev => [...prev, ripple]);
      setTimeout(() => setRipples(prev => prev.filter(r => r.id !== ripple.id)), duration);
    }
  }, [duration]);

  return (
    <div role="button" tabIndex={0} className={cn('relative overflow-hidden', className)} onClick={handleClick} onKeyDown={handleKeyDown}>
      {children}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute rounded-full animate-[ripple_0.6s_ease-out] pointer-events-none"
          style={{ left: ripple.x, top: ripple.y, width: 20, height: 20, marginLeft: -10, marginTop: -10, backgroundColor: color, transform: 'scale(0)', animation: `ripple ${duration}ms ease-out` }}
        />
      ))}
    </div>
  );
}
