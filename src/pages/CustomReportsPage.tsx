import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function CustomReportsPage() {
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Relatórios Personalizados
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Crie e gerencie relatórios customizados
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Relatórios Personalizados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p>Conteúdo de Relatórios Personalizados será implementado aqui.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate(-1)}
            >
              Voltar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export { CustomReportsPage };
