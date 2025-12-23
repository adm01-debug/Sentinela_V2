import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X, Download, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImagePreviewModalProps { isOpen: boolean; onClose: () => void; src: string; alt?: string; onDownload?: () => void; }

export function ImagePreviewModal({ isOpen, onClose, src, alt = 'Image', onDownload }: ImagePreviewModalProps) {
  const [zoom, setZoom] = React.useState(1);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 bg-black/90">
        <div className="absolute top-4 right-4 flex gap-2">
          <Button size="icon" variant="ghost" onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}><ZoomOut className="h-4 w-4 text-white" /></Button>
          <Button size="icon" variant="ghost" onClick={() => setZoom(z => Math.min(3, z + 0.25))}><ZoomIn className="h-4 w-4 text-white" /></Button>
          {onDownload && <Button size="icon" variant="ghost" onClick={onDownload}><Download className="h-4 w-4 text-white" /></Button>}
          <Button size="icon" variant="ghost" onClick={onClose}><X className="h-4 w-4 text-white" /></Button>
        </div>
        <div className="flex items-center justify-center p-8 overflow-auto"><img src={src} alt={alt} style={{ transform: 'scale(' + zoom + ')' }} className="max-w-full transition-transform" /></div>
      </DialogContent>
    </Dialog>
  );
}
