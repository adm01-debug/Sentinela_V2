import * as React from 'react';
import { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  snapPoints?: number[];
  defaultSnapPoint?: number;
  className?: string;
  showHandle?: boolean;
  showCloseButton?: boolean;
  blocking?: boolean;
}

export function BottomSheet({
  open,
  onClose,
  children,
  title,
  snapPoints = [0.5, 0.9],
  defaultSnapPoint = 0,
  className,
  showHandle = true,
  showCloseButton = true,
  blocking = true,
}: BottomSheetProps) {
  const [currentSnap, setCurrentSnap] = useState(defaultSnapPoint);
  const [translateY, setTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);

  const currentHeight = typeof window !== 'undefined' ? window.innerHeight * snapPoints[currentSnap] : 400;

  useEffect(() => {
    if (open) { setCurrentSnap(defaultSnapPoint); setTranslateY(0); }
  }, [open, defaultSnapPoint]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
    setIsDragging(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    const diff = e.touches[0].clientY - startY.current;
    setTranslateY(Math.max(0, diff));
  }, [isDragging]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    if (translateY > 100) { onClose(); }
    else if (translateY > 50 && currentSnap > 0) { setCurrentSnap(currentSnap - 1); }
    setTranslateY(0);
  }, [translateY, currentSnap, onClose]);

  if (!open) return null;

  return (
    <>
      {blocking && <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />}
      <div ref={sheetRef} className={cn('fixed bottom-0 left-0 right-0 bg-background rounded-t-2xl shadow-2xl z-50 flex flex-col', className)} style={{ height: currentHeight, transform: `translateY(${translateY}px)`, transition: isDragging ? 'none' : 'transform 0.3s ease-out, height 0.3s ease-out' }}>
        {showHandle && (
          <div className="flex justify-center py-3 cursor-grab" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
            <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
          </div>
        )}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-4 pb-2 border-b">
            {title && <h3 className="font-semibold">{title}</h3>}
            {showCloseButton && <button onClick={onClose} className="p-1 hover:bg-muted rounded-full"><X className="h-5 w-5" /></button>}
          </div>
        )}
        <div className="flex-1 overflow-auto p-4">{children}</div>
      </div>
    </>
  );
}
export default BottomSheet;
