import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Skeleton } from '@/components/Skeleton';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Props {
  screenshotId: string | null;
  onOpenChange: (open: boolean) => void;
}

interface Capture {
  id: string;
  captured_at: string;
  app_name: string | null;
  window_title: string | null;
  capture_url: string;
  extracted_text: string | null;
  device: string | null;
  employee_name: string;
}

export function ScreenshotViewerDialog({ screenshotId, onOpenChange }: Props) {
  const open = !!screenshotId;

  const { data, isLoading } = useQuery({
    queryKey: ['screenshot-detail', screenshotId],
    enabled: open,
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<Capture | null> => {
      const { data, error } = await supabase
        .from('screen_captures')
        .select('id, captured_at, app_name, window_title, capture_url, extracted_text, device, employee_name')
        .eq('id', screenshotId!)
        .maybeSingle();
      if (error) throw error;
      return data as Capture | null;
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{data?.window_title ?? data?.app_name ?? 'Screenshot'}</DialogTitle>
          <DialogDescription>
            {data
              ? `${data.employee_name} • ${format(new Date(data.captured_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}`
              : 'Carregando detalhes...'}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <Skeleton className="h-96 w-full" />
        ) : !data ? (
          <div className="p-8 text-center text-muted-foreground">Screenshot não encontrado.</div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {data.app_name && <Badge variant="secondary">{data.app_name}</Badge>}
              {data.device && <Badge variant="outline">{data.device}</Badge>}
            </div>
            <div className="overflow-hidden rounded-lg border bg-muted">
              <img
                src={data.capture_url}
                alt={data.window_title ?? 'Screenshot'}
                className="h-auto max-h-[60vh] w-full object-contain"
                loading="lazy"
              />
            </div>
            {data.extracted_text && (
              <div className="rounded-lg border bg-card p-3">
                <div className="mb-1 text-xs font-semibold text-muted-foreground">Texto extraído (OCR)</div>
                <pre className="max-h-40 overflow-auto whitespace-pre-wrap text-xs text-foreground">
                  {data.extracted_text}
                </pre>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
