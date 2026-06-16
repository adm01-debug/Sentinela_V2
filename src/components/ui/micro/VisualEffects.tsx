import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface PulseIndicatorProps {
  color?: "green" | "red" | "yellow" | "blue";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PulseIndicator({ color = "green", size = "md", className }: PulseIndicatorProps) {
  const colorStyles = {
    green: "bg-green-500",
    red: "bg-red-500",
    yellow: "bg-yellow-500",
    blue: "bg-blue-500",
  };
  const sizeStyles = { sm: "h-2 w-2", md: "h-3 w-3", lg: "h-4 w-4" };
  return (
    <span className={cn("relative flex", sizeStyles[size], className)}>
      <span
        className={cn(
          "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
          colorStyles[color]
        )}
      />
      <span className={cn("relative inline-flex h-full w-full rounded-full", colorStyles[color])} />
    </span>
  );
}

interface SkeletonPulseProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

export function SkeletonPulse({
  className,
  variant = "rectangular",
  width,
  height,
}: SkeletonPulseProps) {
  const variantStyles = { text: "rounded", circular: "rounded-full", rectangular: "rounded-md" };
  return (
    <div
      className={cn("animate-pulse bg-muted", variantStyles[variant], className)}
      style={{ width, height }}
    />
  );
}

interface TypingIndicatorProps {
  className?: string;
}

export function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  );
}

interface FadeInViewProps {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  className?: string;
}

export function FadeInView({ children, delay = 0, direction = "up", className }: FadeInViewProps) {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);
  const directionStyles = {
    up: "translate-y-4",
    down: "-translate-y-4",
    left: "translate-x-4",
    right: "-translate-x-4",
    none: "",
  };
  return (
    <div
      className={cn(
        "transition-all duration-500",
        isVisible
          ? "translate-x-0 translate-y-0 opacity-100"
          : cn("opacity-0", directionStyles[direction]),
        className
      )}
    >
      {children}
    </div>
  );
}

interface HoverCardEffectProps {
  children: React.ReactNode;
  className?: string;
}

export function HoverCardEffect({ children, className }: HoverCardEffectProps) {
  return (
    <div
      className={cn(
        "transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:shadow-md",
        className
      )}
    >
      {children}
    </div>
  );
}

interface GlowEffectProps {
  children: React.ReactNode;
  color?: string;
  className?: string;
}

export function GlowEffect({
  children,
  color = "hsl(var(--primary))",
  className,
}: GlowEffectProps) {
  return (
    <div className={cn("group relative", className)}>
      <div
        className="absolute -inset-0.5 rounded-lg opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-75"
        style={{ background: color }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
