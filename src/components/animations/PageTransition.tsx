import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
  mode?: 'fade' | 'slide' | 'scale' | 'slideUp';
}

const variants = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slide: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.05 },
  },
};

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  mode = 'fade',
}) => {
  const location = useLocation();
  const variant = variants[mode];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={variant.initial}
        animate={variant.animate}
        exit={variant.exit}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// Stagger animation for lists
interface StaggerListProps {
  children: React.ReactNode[];
  staggerDelay?: number;
  className?: string;
}

export const StaggerList: React.FC<StaggerListProps> = ({
  children,
  staggerDelay = 0.05,
  className,
}) => {
  return (
    <motion.div className={className}>
      {React.Children.map(children, (child, index) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            delay: index * staggerDelay,
            ease: 'easeOut',
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

// Animated counter
interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 1,
  className,
  prefix = '',
  suffix = '',
  decimals = 0,
}) => {
  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    const startTime = Date.now();
    const startValue = displayValue;
    const endValue = value;

    const animate = () => {
      const now = Date.now();
      const elapsed = (now - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (endValue - startValue) * easeOut;
      
      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return (
    <span className={className}>
      {prefix}
      {displayValue.toFixed(decimals)}
      {suffix}
    </span>
  );
};

// Ripple effect button
interface RippleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const RippleButton: React.FC<RippleButtonProps> = ({
  children,
  className,
  onClick,
  ...props
}) => {
  const [ripples, setRipples] = React.useState<Array<{ x: number; y: number; id: number }>>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();

    setRipples((prev) => [...prev, { x, y, id }]);
    
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);

    onClick?.(e);
  };

  return (
    <button
      className={`relative overflow-hidden ${className}`}
      onClick={handleClick}
      {...props}
    >
      {children}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-foreground/20 pointer-events-none animate-[ripple_0.6s_ease-out]"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
          }}
        />
      ))}
    </button>
  );
};

// Card hover effect
interface HoverCardEffectProps {
  children: React.ReactNode;
  className?: string;
}

export const HoverCardEffect: React.FC<HoverCardEffectProps> = ({
  children,
  className,
}) => {
  return (
    <motion.div
      className={className}
      whileHover={{
        y: -4,
        boxShadow: 'var(--elevation-3)',
      }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
};

// Fade in on scroll
interface FadeInOnScrollProps {
  children: React.ReactNode;
  className?: string;
  threshold?: number;
}

export const FadeInOnScroll: React.FC<FadeInOnScrollProps> = ({
  children,
  className,
  threshold = 0.1,
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
};

// Pulse animation for notifications
interface PulseIndicatorProps {
  color?: 'primary' | 'success' | 'warning' | 'destructive' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const pulseColors = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  destructive: 'bg-destructive',
  info: 'bg-info',
};

const pulseSizes = {
  sm: 'h-2 w-2',
  md: 'h-3 w-3',
  lg: 'h-4 w-4',
};

export const PulseIndicator: React.FC<PulseIndicatorProps> = ({
  color = 'primary',
  size = 'md',
  className,
}) => {
  return (
    <span className={`relative flex ${className}`}>
      <span
        className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${pulseColors[color]}`}
      />
      <span
        className={`relative inline-flex rounded-full ${pulseColors[color]} ${pulseSizes[size]}`}
      />
    </span>
  );
};

// Skeleton with shimmer
interface ShimmerSkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

const roundedClasses = {
  none: '',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
};

export const ShimmerSkeleton: React.FC<ShimmerSkeletonProps> = ({
  className,
  width,
  height,
  rounded = 'md',
}) => {
  return (
    <div
      className={`
        bg-gradient-to-r from-muted via-muted/50 to-muted
        bg-[length:200%_100%] animate-shimmer
        ${roundedClasses[rounded]}
        ${className}
      `}
      style={{ width, height }}
    />
  );
};
