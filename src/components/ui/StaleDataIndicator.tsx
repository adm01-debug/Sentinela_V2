import { memo } from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface StaleDataIndicatorProps {
  isStale: boolean;
  isFetching: boolean;
  lastUpdated?: Date | null;
  className?: string;
}

/**
 * Shows a subtle indicator when data is stale and being refreshed in background.
 */
export const StaleDataIndicator = memo(function StaleDataIndicator({
  isStale,
  isFetching,
  lastUpdated,
  className,
}: StaleDataIndicatorProps) {
  if (!isStale && !isFetching) return null;

  return (
    <div
      className={cn("inline-flex items-center gap-1.5 text-xs text-muted-foreground", className)}
      role="status"
      aria-live="polite"
    >
      {isFetching ? (
        <>
          <RefreshCw className="h-3 w-3 animate-spin" />
          <span>Atualizando...</span>
        </>
      ) : isStale ? (
        <>
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-warning" />
          <span>
            Dados desatualizados
            {lastUpdated && (
              <>
                {" "}
                · Última atualização:{" "}
                {lastUpdated.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </>
            )}
          </span>
        </>
      ) : null}
    </div>
  );
});
