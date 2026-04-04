import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Check, X, Loader2, Heart, Star, ThumbsUp, Bookmark, Bell } from 'lucide-react';

// ============================================
// ANIMATED BUTTON WITH LOADING/SUCCESS STATES
// ============================================

type ButtonState = 'idle' | 'loading' | 'success' | 'error';

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  state?: ButtonState;
  loadingText?: string;
  successText?: string;
  errorText?: string;
  onComplete?: () => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function AnimatedButton({
  children,
  state = 'idle',
  loadingText = 'Carregando...',
  successText = 'Sucesso!',
  errorText = 'Erro!',
  onComplete,
  variant = 'default',
  size = 'md',
  className,
  disabled,
  ...props
}: AnimatedButtonProps) {
  useEffect(() => {
    if (state === 'success' || state === 'error') {
      const timer = setTimeout(() => onComplete?.(), 2000);
      return () => clearTimeout(timer);
    }
  }, [state, onComplete]);

  const baseStyles = 'relative inline-flex items-center justify-center font-medium transition-all duration-300 rounded-md overflow-hidden';
  
  const variantStyles = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
  };
  
  const sizeStyles = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
  };

  const stateStyles = {
    idle: '',
    loading: 'cursor-wait',
    success: 'bg-green-600 hover:bg-green-600',
    error: 'bg-destructive hover:bg-destructive',
  };

  return (
    <button
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        stateStyles[state],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={disabled || state === 'loading'}
      {...props}
    >
      <span className={cn(
        'flex items-center gap-2 transition-all duration-300',
        state !== 'idle' && 'opacity-0 scale-90'
      )}>
        {children}
      </span>

      {state === 'loading' && (
        <span className="absolute inset-0 flex items-center justify-center gap-2 animate-fade-in">
          <Loader2 className="h-4 w-4 animate-spin" />
          {loadingText}
        </span>
      )}

      {state === 'success' && (
        <span className="absolute inset-0 flex items-center justify-center gap-2 animate-scale-in">
          <Check className="h-4 w-4" />
          {successText}
        </span>
      )}

      {state === 'error' && (
        <span className="absolute inset-0 flex items-center justify-center gap-2 animate-scale-in">
          <X className="h-4 w-4" />
          {errorText}
        </span>
      )}
    </button>
  );
}

// ============================================
// RIPPLE EFFECT
// ============================================

interface RippleProps {
  color?: string;
  duration?: number;
  children: React.ReactNode;
  className?: string;
}

export function Ripple({ color = 'rgba(255,255,255,0.3)', duration = 600, children, className }: RippleProps) {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();

    setRipples((prev) => [...prev, { x, y, id }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, duration);
  };

  return (
    <div className={cn('relative overflow-hidden', className)} onClick={handleClick}>
      {children}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute rounded-full pointer-events-none animate-ping"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 20,
            height: 20,
            marginLeft: -10,
            marginTop: -10,
            backgroundColor: color,
            animation: `ripple ${duration}ms ease-out`,
          }}
        />
      ))}
    </div>
  );
}

// ============================================
// TOGGLE ANIMATIONS
// ============================================

interface AnimatedToggleProps {
  isOn: boolean;
  onToggle: (value: boolean) => void;
  icon?: 'heart' | 'star' | 'bookmark' | 'bell' | 'thumbsUp';
  size?: 'sm' | 'md' | 'lg';
  activeColor?: string;
  className?: string;
}

const toggleIcons = {
  heart: Heart,
  star: Star,
  bookmark: Bookmark,
  bell: Bell,
  thumbsUp: ThumbsUp,
};

export function AnimatedToggle({
  isOn,
  onToggle,
  icon = 'heart',
  size = 'md',
  activeColor = 'text-red-500',
  className,
}: AnimatedToggleProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const Icon = toggleIcons[icon];

  const sizeStyles = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const handleClick = () => {
    setIsAnimating(true);
    onToggle(!isOn);
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'relative transition-transform duration-200 hover:scale-110 active:scale-95',
        className
      )}
    >
      <Icon
        className={cn(
          sizeStyles[size],
          'transition-all duration-300',
          isOn ? cn(activeColor, 'fill-current') : 'text-muted-foreground',
          isAnimating && 'animate-bounce'
        )}
      />
      {isAnimating && isOn && (
        <span className="absolute inset-0 animate-ping">
          <Icon className={cn(sizeStyles[size], activeColor, 'opacity-75')} />
        </span>
      )}
    </button>
  );
}

// ============================================
// NUMBER COUNTER ANIMATION
// ============================================

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  formatValue?: (value) => string;
  className?: string;
}

export function AnimatedCounter({
  value,
  duration = 1000,
  formatValue = (v) => v.toLocaleString('pt-BR'),
  className,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const startValue = displayValue;
    const diff = value - startValue;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      setDisplayValue(Math.round(startValue + diff * easeOut));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span className={className}>{formatValue(displayValue)}</span>;
}

// ============================================
// SHAKE ANIMATION
// ============================================

interface ShakeProps {
  trigger: boolean;
  intensity?: 'light' | 'medium' | 'strong';
  children: React.ReactNode;
  className?: string;
}

export function Shake({ trigger, intensity = 'medium', children, className }: ShakeProps) {
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    if (trigger) {
      setIsShaking(true);
      const timer = setTimeout(() => setIsShaking(false), 500);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  const intensityStyles = {
    light: 'animate-[shake_0.5s_ease-in-out]',
    medium: 'animate-[shake_0.4s_ease-in-out]',
    strong: 'animate-[shake_0.3s_ease-in-out]',
  };

  return (
    <div className={cn(isShaking && intensityStyles[intensity], className)}>
      {children}
    </div>
  );
}

// ============================================
// PULSE INDICATOR
// ============================================

interface PulseIndicatorProps {
  color?: 'green' | 'red' | 'yellow' | 'blue';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PulseIndicator({ color = 'green', size = 'md', className }: PulseIndicatorProps) {
  const colorStyles = {
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    blue: 'bg-blue-500',
  };

  const sizeStyles = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4',
  };

  return (
    <span className={cn('relative flex', sizeStyles[size], className)}>
      <span className={cn(
        'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
        colorStyles[color]
      )} />
      <span className={cn(
        'relative inline-flex rounded-full h-full w-full',
        colorStyles[color]
      )} />
    </span>
  );
}

// ============================================
// SKELETON PULSE
// ============================================

interface SkeletonPulseProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function SkeletonPulse({
  className,
  variant = 'rectangular',
  width,
  height,
}: SkeletonPulseProps) {
  const variantStyles = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
  };

  return (
    <div
      className={cn(
        'animate-pulse bg-muted',
        variantStyles[variant],
        className
      )}
      style={{ width, height }}
    />
  );
}

// ============================================
// TYPING INDICATOR
// ============================================

interface TypingIndicatorProps {
  className?: string;
}

export function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  );
}

// ============================================
// FADE IN VIEW
// ============================================

interface FadeInViewProps {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  className?: string;
}

export function FadeInView({
  children,
  delay = 0,
  direction = 'up',
  className,
}: FadeInViewProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const directionStyles = {
    up: 'translate-y-4',
    down: '-translate-y-4',
    left: 'translate-x-4',
    right: '-translate-x-4',
    none: '',
  };

  return (
    <div
      className={cn(
        'transition-all duration-500',
        isVisible ? 'opacity-100 translate-x-0 translate-y-0' : cn('opacity-0', directionStyles[direction]),
        className
      )}
    >
      {children}
    </div>
  );
}

// ============================================
// HOVER CARD EFFECT
// ============================================

interface HoverCardEffectProps {
  children: React.ReactNode;
  className?: string;
}

export function HoverCardEffect({ children, className }: HoverCardEffectProps) {
  return (
    <div
      className={cn(
        'transition-all duration-300 ease-out',
        'hover:shadow-lg hover:-translate-y-1',
        'active:translate-y-0 active:shadow-md',
        className
      )}
    >
      {children}
    </div>
  );
}

// ============================================
// GLOW EFFECT
// ============================================

interface GlowEffectProps {
  children: React.ReactNode;
  color?: string;
  className?: string;
}

export function GlowEffect({
  children,
  color = 'hsl(var(--primary))',
  className,
}: GlowEffectProps) {
  return (
    <div
      className={cn('relative group', className)}
    >
      <div
        className="absolute -inset-0.5 rounded-lg opacity-0 group-hover:opacity-75 transition-opacity duration-300 blur-sm"
        style={{ background: color }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}

export default {
  AnimatedButton,
  Ripple,
  AnimatedToggle,
  AnimatedCounter,
  Shake,
  PulseIndicator,
  SkeletonPulse,
  TypingIndicator,
  FadeInView,
  HoverCardEffect,
  GlowEffect,
};
