import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function ScheduledReportsPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Relatórios Agendados</h1>
          <p className="text-muted-foreground mt-1">Configure relatórios automáticos</p>
        </div>
      </div>
      <Card>
        <CardHeader><CardTitle>Relatórios Agendados</CardTitle></CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Conteúdo de Relatórios Agendados será implementado aqui.</p>
            <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>Voltar</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export { ScheduledReportsPage };
