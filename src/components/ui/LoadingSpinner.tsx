import { memo } from "react";
import { Loader2, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

function LoadingSpinnerComponent({ size = "md", className, text }: LoadingSpinnerProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <Loader2 className={cn("animate-spin text-muted-foreground", sizeClasses[size])} />
      {text && <p className="mt-2 text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}

export const LoadingSpinner = memo(LoadingSpinnerComponent);

/**
 * Branded splash screen for initial app load / auth checks.
 * Shows the Sentinela logo with a subtle pulse animation.
 */
export function BrandedSplash() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 overflow-hidden bg-background">
      <div className="relative">
        {/* Glow rings */}
        <div className="absolute inset-0 scale-150 animate-pulse rounded-2xl bg-primary/25 blur-2xl" />
        <div className="absolute inset-0 animate-pulse rounded-2xl bg-accent/20 blur-xl delay-700" />

        <div className="group relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-primary to-accent shadow-2xl">
          <Shield className="h-10 w-10 text-white duration-500 animate-in zoom-in-50" />
          <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>
      </div>

      <div className="space-y-2 text-center delay-150 duration-700 animate-in fade-in slide-in-from-bottom-4">
        <h1 className="text-2xl font-black uppercase italic tracking-tighter text-foreground">
          Sentinela<span className="not-italic text-primary">v2</span>
        </h1>
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground/80">
            Autenticando acesso seguro
          </p>
          <div className="h-1 w-48 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full animate-[shimmer_2s_infinite_linear] bg-primary"
              style={{
                width: "40%",
                backgroundImage:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
              }}
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
      `}</style>
    </div>
  );
}
