import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { Button } from '@/components/ui/button';
import { Home, AlertTriangle } from 'lucide-react';

export const NotFoundPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center space-y-4 p-8">
      <div className="mx-auto w-fit p-4 rounded-full bg-muted">
        <AlertTriangle className="h-12 w-12 text-muted-foreground" />
      </div>
      <h1 className="text-7xl font-bold text-muted-foreground/30">404</h1>
      <h2 className="text-2xl font-semibold text-foreground">Página não encontrada</h2>
      <p className="text-muted-foreground max-w-md">
        A página que você procura não existe ou foi movida.
      </p>
      <Link to={ROUTES.DASHBOARD}>
        <Button className="mt-4 gap-2">
          <Home className="h-4 w-4" />
          Ir para o Dashboard
        </Button>
      </Link>
    </div>
  </div>
);

export default NotFoundPage;
