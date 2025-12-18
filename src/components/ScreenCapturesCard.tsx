import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Monitor, Loader2, Maximize2, FileText, Copy, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

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

export function ScreenCapturesCard() {
  const [captures, setCaptures] = useState<ScreenCapture[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCapture, setSelectedCapture] = useState<ScreenCapture | null>(null);
  const [ocrLoading, setOcrLoading] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchCaptures();
  }, []);

  const fetchCaptures = async () => {
    try {
      const { data, error } = await supabase
        .from('screen_captures')
        .select('*')
        .order('captured_at', { ascending: false })
        .limit(12);

      if (error) throw error;
      setCaptures(data || []);
    } catch (error) {
      console.error('Error fetching screen captures:', error);
    } finally {
      setLoading(false);
    }
  };

  const runOcr = async (capture: ScreenCapture) => {
    setOcrLoading(capture.id);
    try {
      const { data, error } = await supabase.functions.invoke('ocr-screenshot', {
        body: {
          screenshot_id: capture.id,
          screenshot_url: capture.capture_url
        }
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      // Update local state
      setCaptures(prev => prev.map(c => 
        c.id === capture.id 
          ? { ...c, extracted_text: data.extracted_text, ocr_processed_at: new Date().toISOString() }
          : c
      ));

      if (selectedCapture?.id === capture.id) {
        setSelectedCapture({
          ...selectedCapture,
          extracted_text: data.extracted_text,
          ocr_processed_at: new Date().toISOString()
        });
      }

      toast.success('Texto extraído com sucesso!');
    } catch (error) {
      console.error('OCR error:', error);
      toast.error('Erro ao extrair texto da imagem');
    } finally {
      setOcrLoading(null);
    }
  };

  const copyText = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Texto copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5 text-primary" />
            Capturas de Tela
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5 text-primary" />
            Capturas de Tela
          </CardTitle>
        </CardHeader>
        <CardContent>
          {captures.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma captura de tela
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {captures.map((capture) => (
                <div
                  key={capture.id}
                  className="relative group cursor-pointer rounded-lg overflow-hidden border border-border/50 bg-muted/30"
                  onClick={() => setSelectedCapture(capture)}
                >
                  <div className="aspect-video relative">
                    <img
                      src={capture.capture_url}
                      alt={`Captura de ${capture.employee_name}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Maximize2 className="h-5 w-5 text-white" />
                      {capture.extracted_text && (
                        <FileText className="h-5 w-5 text-green-400" />
                      )}
                    </div>
                    {capture.extracted_text && (
                      <div className="absolute top-1 right-1">
                        <Badge variant="secondary" className="bg-green-500/80 text-white text-[10px] px-1">
                          OCR
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="text-sm font-medium truncate">{capture.employee_name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {capture.window_title || capture.app_name || 'Desktop'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(capture.captured_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedCapture} onOpenChange={() => setSelectedCapture(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh]">
          {selectedCapture && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{selectedCapture.employee_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedCapture.window_title || selectedCapture.app_name || 'Desktop'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(selectedCapture.captured_at).toLocaleString('pt-BR')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {selectedCapture.device && (
                    <Badge variant="outline">{selectedCapture.device}</Badge>
                  )}
                  <Button
                    size="sm"
                    variant={selectedCapture.extracted_text ? "outline" : "default"}
                    onClick={() => runOcr(selectedCapture)}
                    disabled={ocrLoading === selectedCapture.id}
                  >
                    {ocrLoading === selectedCapture.id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Extraindo...
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4 mr-2" />
                        {selectedCapture.extracted_text ? 'Reprocessar OCR' : 'Extrair Texto (OCR)'}
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <Tabs defaultValue="image" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="image">Imagem</TabsTrigger>
                  <TabsTrigger value="text" disabled={!selectedCapture.extracted_text}>
                    Texto Extraído
                    {selectedCapture.extracted_text && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        OCR
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="image" className="mt-4">
                  <img
                    src={selectedCapture.capture_url}
                    alt={`Captura de ${selectedCapture.employee_name}`}
                    className="w-full rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                </TabsContent>
                
                <TabsContent value="text" className="mt-4">
                  {selectedCapture.extracted_text && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          Processado em: {selectedCapture.ocr_processed_at 
                            ? new Date(selectedCapture.ocr_processed_at).toLocaleString('pt-BR')
                            : 'N/A'}
                        </p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyText(selectedCapture.extracted_text!)}
                        >
                          {copied ? (
                            <Check className="h-4 w-4 mr-1" />
                          ) : (
                            <Copy className="h-4 w-4 mr-1" />
                          )}
                          Copiar
                        </Button>
                      </div>
                      <ScrollArea className="h-[400px] rounded-lg border bg-muted/30 p-4">
                        <pre className="text-sm whitespace-pre-wrap font-mono">
                          {selectedCapture.extracted_text}
                        </pre>
                      </ScrollArea>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
