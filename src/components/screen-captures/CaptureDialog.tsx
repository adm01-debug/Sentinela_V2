import { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { FileText, Copy, Check, Loader2, AlertTriangle } from 'lucide-react';

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

interface CaptureDialogProps {
  capture: ScreenCapture | null;
  onClose: () => void;
  onRunOcr: (capture: ScreenCapture) => void;
  ocrLoading: string | null;
  copied: boolean;
  onCopy: (text: string) => void;
  findSensitiveKeywords: (text: string | null) => { keyword: string; severity: string }[];
  highlightSensitiveText: (text: string | null) => ReactNode;
}

export function CaptureDialog({
  capture,
  onClose,
  onRunOcr,
  ocrLoading,
  copied,
  onCopy,
  findSensitiveKeywords,
  highlightSensitiveText,
}: CaptureDialogProps) {
  if (!capture) return null;

  return (
    <Dialog open={!!capture} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{capture.employee_name}</h3>
              <p className="text-sm text-muted-foreground">{capture.window_title || capture.app_name || 'Desktop'}</p>
              <p className="text-xs text-muted-foreground">{new Date(capture.captured_at).toLocaleString('pt-BR')}</p>
            </div>
            <div className="flex items-center gap-2">
              {capture.device && <Badge variant="outline">{capture.device}</Badge>}
              <Button size="sm" variant={capture.extracted_text ? "outline" : "default"} onClick={() => onRunOcr(capture)} disabled={ocrLoading === capture.id}>
                {ocrLoading === capture.id ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Extraindo...</>) : (<><FileText className="h-4 w-4 mr-2" />{capture.extracted_text ? 'Reprocessar OCR' : 'Extrair Texto (OCR)'}</>)}
              </Button>
            </div>
          </div>

          <Tabs defaultValue="image" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="image">Imagem</TabsTrigger>
              <TabsTrigger value="text" disabled={!capture.extracted_text}>
                Texto Extraído
                {capture.extracted_text && <Badge variant="secondary" className="ml-2 text-xs">OCR</Badge>}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="image" className="mt-4">
              <img src={capture.capture_url} alt={`Captura de ${capture.employee_name}`} className="w-full rounded-lg" onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }} />
            </TabsContent>
            
            <TabsContent value="text" className="mt-4">
              {capture.extracted_text && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">
                        Processado em: {capture.ocr_processed_at ? new Date(capture.ocr_processed_at).toLocaleString('pt-BR') : 'N/A'}
                      </p>
                      {(() => {
                        const foundKeywords = findSensitiveKeywords(capture.extracted_text!);
                        if (foundKeywords.length > 0) {
                          return (
                            <Badge variant="destructive" className="text-xs flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              {foundKeywords.length} palavra(s) sensível(is)
                            </Badge>
                          );
                        }
                        return null;
                      })()}
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => onCopy(capture.extracted_text!)} className="gap-1">
                      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      {copied ? 'Copiado!' : 'Copiar'}
                    </Button>
                  </div>
                  <ScrollArea className="h-[300px] rounded-md border p-4">
                    <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">
                      {highlightSensitiveText(capture.extracted_text)}
                    </pre>
                  </ScrollArea>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
