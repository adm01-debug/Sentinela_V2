import { Link } from 'react-router-dom';
import { ShieldX, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center">
        <ShieldX className="h-24 w-24 text-destructive mx-auto" />
        <h1 className="text-6xl font-bold mt-6">403</h1>
        <h2 className="text-2xl font-semibold mt-4">Acesso Negado</h2>
        <p className="text-muted-foreground mt-2 max-w-md">Você não tem permissão para acessar esta página. Entre em contato com o administrador se acredita que isso é um erro.</p>
        <div className="flex gap-4 justify-center mt-8">
          <Button variant="outline" onClick={() => window.history.back()}><ArrowLeft className="mr-2 h-4 w-4" />Voltar</Button>
          <Link to="/"><Button><Home className="mr-2 h-4 w-4" />Página Inicial</Button></Link>
        </div>
      </div>
    </div>
  );
}