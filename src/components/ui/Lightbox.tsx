import * as React from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from './Button';
import { Dialog, DialogContent } from './Dialog';

interface LightboxProps {
  images: { src: string; alt?: string; title?: string }[];
  initialIndex?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function Lightbox({ images, initialIndex = 0, open, onOpenChange }: LightboxProps) {
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);
  const [zoom, setZoom] = React.useState(1);

  const current = images[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < images.length - 1;

  const prev = () => { if (hasPrev) setCurrentIndex(i => i - 1); setZoom(1); };
  const next = () => { if (hasNext) setCurrentIndex(i => i + 1); setZoom(1); };

  React.useEffect(() => { setCurrentIndex(initialIndex); }, [initialIndex]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-0">
        <div className="absolute top-4 right-4 z-50 flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => setZoom(z => Math.max(0.5, z - 0.25))} className="text-white hover:bg-white/20">
            <ZoomOut className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setZoom(z => Math.min(3, z + 0.25))} className="text-white hover:bg-white/20">
            <ZoomIn className="h-5 w-5" />
          </Button>
          <a href={current.src} download>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <Download className="h-5 w-5" />
            </Button>
          </a>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="text-white hover:bg-white/20">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex items-center justify-center h-[80vh] overflow-hidden">
          <img src={current.src} alt={current.alt || ''} style={{ transform: `scale(${zoom})` }} className="max-h-full max-w-full object-contain transition-transform" />
        </div>

        {hasPrev && (
          <Button variant="ghost" size="icon" onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12">
            <ChevronLeft className="h-8 w-8" />
          </Button>
        )}
        {hasNext && (
          <Button variant="ghost" size="icon" onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12">
            <ChevronRight className="h-8 w-8" />
          </Button>
        )}

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
          {currentIndex + 1} / {images.length}
          {current.title && <span className="ml-4">{current.title}</span>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
