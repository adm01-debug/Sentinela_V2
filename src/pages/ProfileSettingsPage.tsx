import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent  } from '@/components/ui/card';
import { Button  } from '@/components/ui/button';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function ProfileSettingsPage() {
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
            Configurações de Perfil
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Gerencie suas informações pessoais e preferências
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configurações de Perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p>Conteúdo de Configurações de Perfil será implementado aqui.</p>
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

export { ProfileSettingsPage };
