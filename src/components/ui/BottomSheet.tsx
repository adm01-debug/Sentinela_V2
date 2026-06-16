import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
  height?: "auto" | "half" | "full";
}

export function BottomSheet({
  open,
  onClose,
  children,
  title,
  description,
  className,
  height = "half",
}: BottomSheetProps) {
  const [dragY, setDragY] = React.useState(0);
  const startY = React.useRef(0);

  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    const diff = e.touches[0].clientY - startY.current;
    if (diff > 0) setDragY(diff);
  };
  const handleTouchEnd = () => {
    if (dragY > 100) onClose();
    setDragY(0);
  };

  const heightClass =
    height === "full" ? "h-[90vh]" : height === "half" ? "h-[50vh]" : "h-auto max-h-[80vh]";

  if (!open) return null;

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-label="Close"
        className="fixed inset-0 z-40 bg-black/50 animate-in fade-in"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClose();
          }
        }}
      />
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-background shadow-2xl duration-300 animate-in slide-in-from-bottom",
          heightClass,
          className
        )}
        style={{ transform: `translateY(${dragY}px)` }}
      >
        <div
          className="flex cursor-grab justify-center pb-2 pt-3"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="h-1.5 w-12 rounded-full bg-muted-foreground/30" />
        </div>
        {(title || description) && (
          <div className="flex items-start justify-between border-b px-4 pb-4">
            <div>
              {title && <h3 className="font-semibold">{title}</h3>}
              {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </div>
            <button onClick={onClose} className="rounded-full p-1 hover:bg-muted">
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        <div className="overflow-auto px-4 py-4" style={{ maxHeight: "calc(100% - 80px)" }}>
          {children}
        </div>
      </div>
    </>
  );
}

export default BottomSheet;
