import { memo, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  PartyPopper, 
  Sparkles, 
  Trophy, 
  Star,
  Rocket,
  ThumbsUp,
  Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================

type AnimationType = 'check' | 'confetti' | 'sparkle' | 'trophy' | 'rocket' | 'thumbsUp' | 'heart';

interface SuccessAnimationProps {
  type?: AnimationType;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  onComplete?: () => void;
  autoPlay?: boolean;
}

// ============================================================
// CONFETTI PARTICLES
// ============================================================

const ConfettiParticle = memo(function ConfettiParticle({ 
  delay, 
  x, 
  color 
}: { 
  delay: number; 
  x: number; 
  color: string; 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 0, x: 0, scale: 0, rotate: 0 }}
      animate={{
        opacity: [0, 1, 1, 0],
        y: [-20, -60, -40, 20],
        x: [0, x * 0.5, x, x * 1.2],
        scale: [0, 1, 1, 0.5],
        rotate: [0, 180, 360, 540],
      }}
      transition={{
        duration: 1.2,
        delay,
        ease: 'easeOut',
      }}
      className="absolute"
      style={{ backgroundColor: color }}
    >
      <div className={cn(
        'w-2 h-2 rounded-sm',
        Math.random() > 0.5 ? 'rounded-full' : ''
      )} 
      style={{ backgroundColor: color }}
      />
    </motion.div>
  );
});

const Confetti = memo(function Confetti() {
  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
  const particles = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    delay: Math.random() * 0.3,
    x: (Math.random() - 0.5) * 120,
    color: colors[Math.floor(Math.random() * colors.length)],
  }));

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-visible">
      {particles.map((p) => (
        <ConfettiParticle key={p.id} delay={p.delay} x={p.x} color={p.color} />
      ))}
    </div>
  );
});

// ============================================================
// SPARKLE PARTICLES
// ============================================================

const Sparkle = memo(function Sparkle({ delay, x, y }: { delay: number; x: number; y: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 1, 0],
        scale: [0, 1, 0],
      }}
      transition={{
        duration: 0.6,
        delay,
        ease: 'easeOut',
      }}
      className="absolute"
      style={{ left: `${50 + x}%`, top: `${50 + y}%` }}
    >
      <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
    </motion.div>
  );
});

const SparkleEffect = memo(function SparkleEffect() {
  const sparkles = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    delay: i * 0.1,
    x: (Math.random() - 0.5) * 80,
    y: (Math.random() - 0.5) * 80,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible">
      {sparkles.map((s) => (
        <Sparkle key={s.id} delay={s.delay} x={s.x} y={s.y} />
      ))}
    </div>
  );
});

// ============================================================
// RING PULSE
// ============================================================

const RingPulse = memo(function RingPulse({ color }: { color: string }) {
  return (
    <>
      {[0, 0.2, 0.4].map((delay, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0.5, scale: 0.8 }}
          animate={{ opacity: 0, scale: 2 }}
          transition={{ 
            duration: 1, 
            delay,
            ease: 'easeOut',
          }}
          className="absolute inset-0 rounded-full border-2"
          style={{ borderColor: color }}
        />
      ))}
    </>
  );
});

// ============================================================
// SUCCESS ANIMATIONS
// ============================================================

const animations: Record<AnimationType, {
  icon: React.FC<{ className?: string }>;
  color: string;
  bgColor: string;
}> = {
  check: { 
    icon: CheckCircle, 
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
  },
  confetti: { 
    icon: PartyPopper, 
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
  },
  sparkle: { 
    icon: Sparkles, 
    color: 'text-violet-500',
    bgColor: 'bg-violet-500/10',
  },
  trophy: { 
    icon: Trophy, 
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
  },
  rocket: { 
    icon: Rocket, 
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  thumbsUp: { 
    icon: ThumbsUp, 
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
  },
  heart: { 
    icon: Heart, 
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10',
  },
};

const sizes = {
  sm: { container: 'w-12 h-12', icon: 'h-6 w-6' },
  md: { container: 'w-16 h-16', icon: 'h-8 w-8' },
  lg: { container: 'w-24 h-24', icon: 'h-12 w-12' },
};

// ============================================================
// MAIN COMPONENT
// ============================================================

export const SuccessAnimation = memo(function SuccessAnimation({
  type = 'check',
  size = 'md',
  onComplete,
  autoPlay = true,
}: SuccessAnimationProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const config = animations[type];
  const sizeConfig = sizes[size];
  const Icon = config.icon;

  const handleComplete = useCallback(() => {
    setIsPlaying(false);
    onComplete?.();
  }, [onComplete]);

  if (!isPlaying) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onAnimationComplete={() => setTimeout(handleComplete, 1500)}
        className="relative flex items-center justify-center"
      >
        {/* Ring pulse effect */}
        <RingPulse color={`hsl(var(--${type === 'check' ? 'primary' : 'accent'}))`} />
        
        {/* Confetti for celebration types */}
        {(type === 'confetti' || type === 'trophy') && <Confetti />}
        
        {/* Sparkles for sparkle type */}
        {(type === 'sparkle' || type === 'trophy') && <SparkleEffect />}
        
        {/* Main icon container */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ 
            scale: [0, 1.2, 1],
            rotate: [type === 'rocket' ? -45 : -180, type === 'rocket' ? -45 : 0, type === 'rocket' ? -45 : 0],
          }}
          transition={{
            duration: 0.6,
            ease: [0.34, 1.56, 0.64, 1],
          }}
          className={cn(
            'relative z-10 rounded-full flex items-center justify-center',
            sizeConfig.container,
            config.bgColor
          )}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <Icon className={cn(sizeConfig.icon, config.color)} />
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
});

// ============================================================
// SUCCESS OVERLAY (Full screen celebration)
// ============================================================

interface SuccessOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  type?: AnimationType;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export const SuccessOverlay = memo(function SuccessOverlay({
  isOpen,
  onClose,
  title = 'Sucesso!',
  description,
  type = 'confetti',
  autoClose = true,
  autoCloseDelay = 2500,
}: SuccessOverlayProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          onAnimationComplete={() => {
            if (autoClose) {
              setTimeout(onClose, autoCloseDelay);
            }
          }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            className="flex flex-col items-center gap-4 p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <SuccessAnimation type={type} size="lg" />
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center mt-4"
            >
              <h3 className="text-2xl font-bold">{title}</h3>
              {description && (
                <p className="text-muted-foreground mt-2">{description}</p>
              )}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

// ============================================================
// HOOK FOR SUCCESS ANIMATION
// ============================================================

export function useSuccessAnimation() {
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayProps, setOverlayProps] = useState<Partial<SuccessOverlayProps>>({});

  const celebrate = useCallback((props?: Partial<SuccessOverlayProps>) => {
    setOverlayProps(props || {});
    setShowOverlay(true);
  }, []);

  const close = useCallback(() => {
    setShowOverlay(false);
  }, []);

  const SuccessOverlayComponent = useCallback(() => (
    <SuccessOverlay
      isOpen={showOverlay}
      onClose={close}
      {...overlayProps}
    />
  ), [showOverlay, close, overlayProps]);

  return {
    celebrate,
    close,
    SuccessOverlay: SuccessOverlayComponent,
    isOpen: showOverlay,
  };
}

export default SuccessAnimation;
