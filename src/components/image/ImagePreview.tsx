import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

interface ImagePreviewProps {
  src: string;
  alt?: string;
  open: boolean;
  onClose: () => void;
}

export function ImagePreview({ src, alt = 'Preview', open, onClose }: ImagePreviewProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.25, 3));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.25, 0.5));
  const handleRotate = () => setRotation(r => (r + 90) % 360);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 bg-black/90">
        <div className="absolute top-2 right-2 flex gap-1 z-10">
          <Button variant="ghost" size="icon" onClick={handleZoomOut}><ZoomOut className="h-4 w-4 text-white" /></Button>
          <Button variant="ghost" size="icon" onClick={handleZoomIn}><ZoomIn className="h-4 w-4 text-white" /></Button>
          <Button variant="ghost" size="icon" onClick={handleRotate}><RotateCw className="h-4 w-4 text-white" /></Button>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4 text-white" /></Button>
        </div>
        <div className="flex items-center justify-center min-h-[400px] overflow-hidden">
          <img src={src} alt={alt} className="max-w-full max-h-[80vh] object-contain transition-transform" style={{ transform: `scale(${zoom}) rotate(${rotation}deg)` }} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
