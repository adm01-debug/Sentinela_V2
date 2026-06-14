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

export function BottomSheet({ open, onClose, children, title, description, className, height = "half" }: BottomSheetProps) {
  const [dragY, setDragY] = React.useState(0);
  const startY = React.useRef(0);

  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const handleTouchStart = (e: React.TouchEvent) => { startY.current = e.touches[0].clientY; };
  const handleTouchMove = (e: React.TouchEvent) => { const diff = e.touches[0].clientY - startY.current; if (diff > 0) setDragY(diff); };
  const handleTouchEnd = () => { if (dragY > 100) onClose(); setDragY(0); };

  const heightClass = height === "full" ? "h-[90vh]" : height === "half" ? "h-[50vh]" : "h-auto max-h-[80vh]";

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40 animate-in fade-in" onClick={onClose} />
      <div className={cn("fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom duration-300", heightClass, className)} style={{ transform: `translateY(${dragY}px)` }}>
        <div className="flex justify-center pt-3 pb-2 cursor-grab" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
          <div className="w-12 h-1.5 rounded-full bg-muted-foreground/30" />
        </div>
        {(title || description) && (
          <div className="flex items-start justify-between px-4 pb-4 border-b">
            <div>
              {title && <h3 className="font-semibold">{title}</h3>}
              {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </div>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-muted"><X className="h-5 w-5" /></button>
          </div>
        )}
        <div className="overflow-auto px-4 py-4" style={{ maxHeight: "calc(100% - 80px)" }}>{children}</div>
      </div>
    </>
  );
}

export default BottomSheet;
