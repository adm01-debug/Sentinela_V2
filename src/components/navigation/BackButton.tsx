import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface BackButtonProps {
  className?: string;
  label?: string;
  fallbackPath?: string;
}

export function BackButton({ className, label = "Voltar", fallbackPath }: BackButtonProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine if we have history to go back to
  // If the path is just '/' or '/dashboard', we might not want to show it or go back to login
  const canGoBack = window.history.length > 1 && location.key !== "default";

  const handleBack = () => {
    if (canGoBack) {
      navigate(-1);
    } else if (fallbackPath) {
      navigate(fallbackPath);
    } else {
      // Default fallback to dashboard if no history
      navigate("/dashboard");
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className={cn(
              "group h-8 gap-1.5 px-2 text-muted-foreground transition-all hover:bg-muted hover:text-foreground active:scale-95",
              className
            )}
            aria-label={label}
          >
            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            <span className="text-xs font-medium">{label}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="text-[10px]">Atalho: Esc</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
