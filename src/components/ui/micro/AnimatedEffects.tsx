import React, { useState, useEffect } from 'react';
import { Heart, Star, ThumbsUp, Bookmark, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

const toggleIcons = { heart: Heart, star: Star, bookmark: Bookmark, bell: Bell, thumbsUp: ThumbsUp };

interface AnimatedToggleProps {
  isOn: boolean;
  onToggle: (value: boolean) => void;
  icon?: 'heart' | 'star' | 'bookmark' | 'bell' | 'thumbsUp';
  size?: 'sm' | 'md' | 'lg';
  activeColor?: string;
  className?: string;
}

export function AnimatedToggle({ isOn, onToggle, icon = 'heart', size = 'md', activeColor = 'text-red-500', className }: AnimatedToggleProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const Icon = toggleIcons[icon];
  const sizeStyles = { sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-6 w-6' };

  const handleClick = () => { setIsAnimating(true); onToggle(!isOn); setTimeout(() => setIsAnimating(false), 300); };

  return (
    <button onClick={handleClick} className={cn('relative transition-transform duration-200 hover:scale-110 active:scale-95', className)}>
      <Icon className={cn(sizeStyles[size], 'transition-all duration-300', isOn ? cn(activeColor, 'fill-current') : 'text-muted-foreground', isAnimating && 'animate-bounce')} />
      {isAnimating && isOn && <span className="absolute inset-0 animate-ping"><Icon className={cn(sizeStyles[size], activeColor, 'opacity-75')} /></span>}
    </button>
  );
}

interface AnimatedCounterProps { value: number; duration?: number; formatValue?: (value: number) => string; className?: string; }

export function AnimatedCounter({ value, duration = 1000, formatValue = (v) => v.toLocaleString('pt-BR'), className }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  useEffect(() => {
    const startTime = Date.now(); const startValue = displayValue; const diff = value - startValue;
    const animate = () => {
      const elapsed = Date.now() - startTime; const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(startValue + diff * easeOut));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- displayValue is read only as the animation's starting point; including it would restart the tween every frame
  }, [value, duration]);
  return <span className={className}>{formatValue(displayValue)}</span>;
}

interface ShakeProps { trigger: boolean; intensity?: 'light' | 'medium' | 'strong'; children: React.ReactNode; className?: string; }

export function Shake({ trigger, intensity = 'medium', children, className }: ShakeProps) {
  const [isShaking, setIsShaking] = useState(false);
  useEffect(() => { if (trigger) { setIsShaking(true); const timer = setTimeout(() => setIsShaking(false), 500); return () => clearTimeout(timer); } }, [trigger]);
  const intensityStyles = { light: 'animate-[shake_0.5s_ease-in-out]', medium: 'animate-[shake_0.4s_ease-in-out]', strong: 'animate-[shake_0.3s_ease-in-out]' };
  return <div className={cn(isShaking && intensityStyles[intensity], className)}>{children}</div>;
}
