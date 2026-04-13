import { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Maximize2, FileText, Loader2, Clock } from 'lucide-react';

interface ScreenCapture {
  id: string;
  employee_name: string;
  device: string | null;
  capture_url: string;
  app_name: string | null;
  window_title: string | null;
  captured_at: string;
  extracted_text: string | null;
  ocr_processed_at: string | null;
}

interface CaptureGridProps {
  captures: ScreenCapture[];
  searchQuery: string;
  onSelect: (capture: ScreenCapture) => void;
  highlightMatch: (text: string, query: string) => ReactNode;
  getOcrStatus: (capture: ScreenCapture) => string;
}

function OcrBadge({ status }: { status: string }) {
  if (status === 'completed') {
    return <Badge variant="secondary" className="bg-green-500/80 text-white text-[10px] px-1">OCR</Badge>;
  }
  if (status === 'processing') {
    return <Badge variant="secondary" className="bg-blue-500/80 text-white text-[10px] px-1 flex items-center gap-1"><Loader2 className="h-2.5 w-2.5 animate-spin" />OCR</Badge>;
  }
  if (status === 'no-text') {
    return <Badge variant="secondary" className="bg-gray-500/80 text-white text-[10px] px-1">Sem texto</Badge>;
  }
  return <Badge variant="secondary" className="bg-amber-500/80 text-white text-[10px] px-1 flex items-center gap-1"><Clock className="h-2.5 w-2.5" />Pendente</Badge>;
}

export function CaptureGrid({ captures, searchQuery, onSelect, highlightMatch, getOcrStatus }: CaptureGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {captures.map((capture) => (
        <div
          key={capture.id}
          className="relative group cursor-pointer rounded-lg overflow-hidden border border-border/50 bg-muted/30"
          onClick={() => onSelect(capture)}
        >
          <div className="aspect-video relative">
            <img
              src={capture.capture_url}
              alt={`Captura de ${capture.employee_name}`}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Maximize2 className="h-5 w-5 text-white" />
              {capture.extracted_text && <FileText className="h-5 w-5 text-green-400" />}
            </div>
            <div className="absolute top-1 right-1">
              <OcrBadge status={getOcrStatus(capture)} />
            </div>
          </div>
          <div className="p-2">
            <p className="text-sm font-medium truncate">{highlightMatch(capture.employee_name, searchQuery)}</p>
            <p className="text-xs text-muted-foreground truncate">{highlightMatch(capture.window_title || capture.app_name || 'Desktop', searchQuery)}</p>
            <p className="text-xs text-muted-foreground">{new Date(capture.captured_at).toLocaleString('pt-BR')}</p>
            {searchQuery && capture.extracted_text?.toLowerCase().includes(searchQuery.toLowerCase()) && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-1 truncate">
                <FileText className="h-3 w-3 inline mr-1" />Texto OCR contém "{searchQuery}"
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
