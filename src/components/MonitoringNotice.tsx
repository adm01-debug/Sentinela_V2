import { useState } from "react";
import { AlertTriangle, Eye, X, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface MonitoringNoticeProps {
  text?: string;
  variant?: "admin" | "employee";
  dismissible?: boolean;
  className?: string;
  clickable?: boolean;
}

export function MonitoringNotice({
  text = "Este dispositivo está sendo monitorado para fins de segurança corporativa.",
  variant = "employee",
  dismissible = false,
  className,
  clickable = true,
}: MonitoringNoticeProps) {
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();

  if (dismissed) return null;

  const isAdmin = variant === "admin";

  const handleClick = () => {
    if (clickable && !isAdmin) {
      navigate("/monitoring-policies");
    }
  };

  const isInteractive = clickable && !isAdmin;

  return (
    <div
      onClick={handleClick}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={
        isInteractive
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleClick();
              }
            }
          : undefined
      }
      className={cn(
        "flex items-center gap-3 rounded-lg border px-4 py-3 transition-all",
        isAdmin
          ? "border-blue-500/30 bg-blue-500/10 text-blue-400"
          : "border-amber-500/30 bg-amber-500/10 text-amber-400",
        clickable && !isAdmin && "cursor-pointer hover:bg-amber-500/20",
        className
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full",
          isAdmin ? "bg-blue-500/20" : "bg-amber-500/20"
        )}
      >
        {isAdmin ? <Eye className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
      </div>

      <div className="flex-1">
        <p className={cn("text-sm font-medium", isAdmin ? "text-blue-300" : "text-amber-300")}>
          {isAdmin ? "Modo Administrador" : "Aviso de Monitoramento"}
        </p>
        <p className="text-sm opacity-80">
          {isAdmin ? "Você está visualizando dados de monitoramento dos colaboradores." : text}
        </p>
      </div>

      {clickable && !isAdmin && <ExternalLink className="h-4 w-4 opacity-60" />}

      {dismissible && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setDismissed(true);
          }}
          className="rounded p-1 transition-colors hover:bg-white/10"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

// Standalone employee widget component for embedding
export function EmployeeMonitoringWidget({
  noticeText = "Este dispositivo está sendo monitorado para fins de segurança corporativa.",
}: {
  noticeText?: string;
}) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/monitoring-policies");
  };

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      className="fixed bottom-4 right-4 z-50 max-w-sm cursor-pointer animate-in slide-in-from-bottom-4"
    >
      <div className="flex items-center gap-3 rounded-lg border border-amber-500/30 bg-background/95 px-4 py-3 shadow-lg backdrop-blur transition-colors hover:bg-amber-500/10">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/20">
          <Eye className="h-4 w-4 text-amber-500" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-medium text-amber-500">Monitoramento Ativo</p>
          <p className="text-xs text-muted-foreground">{noticeText}</p>
        </div>
        <ExternalLink className="h-3 w-3 text-amber-500 opacity-60" />
      </div>
    </div>
  );
}
