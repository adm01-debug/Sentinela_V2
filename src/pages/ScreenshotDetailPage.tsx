import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Clock, Monitor, User } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/Skeleton';
import { useScreenshot } from '@/hooks/useScreenshots';

export default function ScreenshotDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: screenshot, isLoading } = useScreenshot(id!);

  if (isLoading) return <div className="p-6"><Skeleton className="h-96" /></div>;
  if (!screenshot) return <div className="p-6">Screenshot não encontrado</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)}><ArrowLeft className="mr-2 h-4 w-4" />Voltar</Button>
        <a href={screenshot.url} download><Button><Download className="mr-2 h-4 w-4" />Baixar</Button></a>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <img src={screenshot.url} alt={screenshot.application} className="w-full rounded-lg shadow-lg" />
        </div>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /><span className="font-medium">{screenshot.employeeName}</span></div>
            <div className="flex items-center gap-2"><Monitor className="h-4 w-4 text-muted-foreground" /><span>{screenshot.application}</span></div>
            <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" /><span>{format(new Date(screenshot.capturedAt), 'dd/MM/yyyy HH:mm:ss')}</span></div>
            {screenshot.windowTitle && <div><span className="text-sm text-muted-foreground">Título da janela:</span><p className="mt-1">{screenshot.windowTitle}</p></div>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}