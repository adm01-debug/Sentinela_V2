import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2, ArrowDown } from "lucide-react";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  className?: string;
  threshold?: number;
  maxPull?: number;
  disabled?: boolean;
  refreshingText?: string;
  pullingText?: string;
  releaseText?: string;
}

type PullState = "idle" | "pulling" | "ready" | "refreshing";

export function PullToRefresh({
  onRefresh,
  children,
  className,
  threshold = 80,
  maxPull = 120,
  disabled = false,
  refreshingText = "Atualizando...",
  pullingText = "Puxe para atualizar",
  releaseText = "Solte para atualizar",
}: PullToRefreshProps) {
  const [pullState, setPullState] = React.useState<PullState>("idle");
  const [pullDistance, setPullDistance] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const startY = React.useRef(0);
  const currentY = React.useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || pullState === "refreshing") return;
    const container = containerRef.current;
    if (container && container.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (disabled || pullState === "refreshing" || startY.current === 0) return;
    currentY.current = e.touches[0].clientY;
    const diff = Math.min(currentY.current - startY.current, maxPull);
    if (diff > 0) {
      setPullDistance(diff);
      setPullState(diff >= threshold ? "ready" : "pulling");
    }
  };

  const handleTouchEnd = async () => {
    if (pullState === "ready") {
      setPullState("refreshing");
      setPullDistance(threshold);
      try {
        await onRefresh();
      } finally {
        setPullState("idle");
        setPullDistance(0);
      }
    } else {
      setPullState("idle");
      setPullDistance(0);
    }
    startY.current = 0;
  };

  const indicatorOpacity = Math.min(pullDistance / threshold, 1);
  const rotation = pullState === "ready" ? 180 : (pullDistance / threshold) * 180;

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-auto touch-pan-y", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="absolute left-0 right-0 flex flex-col items-center justify-center transition-transform duration-200 z-10"
        style={{ top: -60, height: 60, transform: \`translateY(\${pullDistance}px)\`, opacity: indicatorOpacity }}
      >
        {pullState === "refreshing" ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-xs text-muted-foreground mt-1">{refreshingText}</span>
          </>
        ) : (
          <>
            <ArrowDown className="h-6 w-6 text-primary transition-transform" style={{ transform: \`rotate(\${rotation}deg)\` }} />
            <span className="text-xs text-muted-foreground mt-1">{pullState === "ready" ? releaseText : pullingText}</span>
          </>
        )}
      </div>
      <div style={{ transform: \`translateY(\${pullDistance}px)\`, transition: pullState === "idle" ? "transform 0.2s" : "none" }}>
        {children}
      </div>
    </div>
  );
}

export default PullToRefresh;
