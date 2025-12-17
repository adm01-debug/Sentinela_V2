import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Monitor, Loader2, Maximize2, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface ScreenCapture {
  id: string;
  employee_name: string;
  device: string | null;
  capture_url: string;
  app_name: string | null;
  window_title: string | null;
  captured_at: string;
}

export function ScreenCapturesCard() {
  const [captures, setCaptures] = useState<ScreenCapture[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCapture, setSelectedCapture] = useState<ScreenCapture | null>(null);

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
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Maximize2 className="h-6 w-6 text-white" />
                    </div>
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
        <DialogContent className="max-w-4xl">
          {selectedCapture && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold">{selectedCapture.employee_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedCapture.window_title || selectedCapture.app_name || 'Desktop'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(selectedCapture.captured_at).toLocaleString('pt-BR')}
                  </p>
                </div>
                {selectedCapture.device && (
                  <Badge variant="outline">{selectedCapture.device}</Badge>
                )}
              </div>
              <img
                src={selectedCapture.capture_url}
                alt={`Captura de ${selectedCapture.employee_name}`}
                className="w-full rounded-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
