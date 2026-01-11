import { Link } from 'react-router-dom';
import { ServerCrash, RefreshCw, Home, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function ServerErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center">
        <ServerCrash className="h-24 w-24 text-destructive mx-auto" />
        <h1 className="text-6xl font-bold mt-6">500</h1>
        <h2 className="text-2xl font-semibold mt-4">Erro do Servidor</h2>
        <p className="text-muted-foreground mt-2 max-w-md">Algo deu errado em nosso servidor. Nossa equipe foi notificada e está trabalhando na correção.</p>
        <div className="flex gap-4 justify-center mt-8">
          <Button variant="outline" onClick={() => window.location.reload()}><RefreshCw className="mr-2 h-4 w-4" />Tentar Novamente</Button>
          <Link to="/"><Button><Home className="mr-2 h-4 w-4" />Página Inicial</Button></Link>
        </div>
        <Link to="/help/contact" className="inline-flex items-center gap-2 mt-6 text-sm text-muted-foreground hover:text-primary"><MessageSquare className="h-4 w-4" />Reportar problema</Link>
      </div>
    </div>
  );
}