import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Book, Code, Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Endpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  auth: 'apiKey' | 'bearer';
}

const ENDPOINTS: Endpoint[] = [
  { method: 'GET', path: '/api/v1/employees', description: 'Lista colaboradores', auth: 'apiKey' },
  { method: 'GET', path: '/api/v1/employees/{id}', description: 'Detalhe do colaborador', auth: 'apiKey' },
  { method: 'GET', path: '/api/v1/activities', description: 'Atividades registradas', auth: 'apiKey' },
  { method: 'GET', path: '/api/v1/violations', description: 'Violações detectadas', auth: 'apiKey' },
  { method: 'GET', path: '/api/v1/screenshots', description: 'Metadados de screenshots', auth: 'apiKey' },
  { method: 'POST', path: '/api/v1/webhooks', description: 'Registrar webhook', auth: 'apiKey' },
  { method: 'GET', path: '/api/v1/reports/{id}', description: 'Obter relatório gerado', auth: 'apiKey' },
  { method: 'POST', path: '/api/v1/reports', description: 'Gerar novo relatório', auth: 'apiKey' },
];

const METHOD_VARIANT: Record<Endpoint['method'], 'default' | 'secondary' | 'destructive' | 'outline'> = {
  GET: 'secondary',
  POST: 'default',
  PUT: 'outline',
  DELETE: 'destructive',
};

const CURL_EXAMPLE = `curl -X GET "https://api.sentinela.app/api/v1/employees" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`;

export default function ApiDocsPage() {
  const { toast } = useToast();

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copiado', description: 'Comando copiado para a área de transferência.' });
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Book className="h-6 w-6" /> Documentação da API
          </h1>
          <p className="text-muted-foreground">
            Integre com o Sentinela via REST API v1. Autenticação por API Key.
          </p>
        </div>
        <Button variant="outline" asChild>
          <a href="/openapi.yaml" target="_blank" rel="noreferrer">
            <ExternalLink className="h-4 w-4 mr-2" /> OpenAPI YAML
          </a>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Code className="h-4 w-4" /> Autenticação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Todas as requisições devem incluir o header <code className="text-xs bg-muted px-1.5 py-0.5 rounded">Authorization: Bearer &lt;API_KEY&gt;</code>.
            Gere sua chave em Configurações → API Keys.
          </p>
          <div className="relative">
            <pre className="bg-muted rounded-md p-4 text-xs overflow-x-auto">
              <code>{CURL_EXAMPLE}</code>
            </pre>
            <Button
              size="icon"
              variant="ghost"
              aria-label="Copiar exemplo"
              onClick={() => copy(CURL_EXAMPLE)}
              className="absolute top-2 right-2"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Endpoints Disponíveis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {ENDPOINTS.map((ep) => (
              <div
                key={`${ep.method}-${ep.path}`}
                className="flex items-center gap-3 rounded-md border p-3 hover:bg-muted/50 transition-colors"
              >
                <Badge variant={METHOD_VARIANT[ep.method]} className="min-w-16 justify-center">
                  {ep.method}
                </Badge>
                <code className="flex-1 font-mono text-sm truncate">{ep.path}</code>
                <span className="text-sm text-muted-foreground hidden md:inline">{ep.description}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rate Limiting</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1">
          <p>• 100 requisições por minuto por API Key.</p>
          <p>• Header <code className="text-xs bg-muted px-1.5 py-0.5 rounded">X-RateLimit-Remaining</code> indica requisições restantes.</p>
          <p>• Status <code className="text-xs bg-muted px-1.5 py-0.5 rounded">429</code> com <code className="text-xs bg-muted px-1.5 py-0.5 rounded">Retry-After</code> quando excedido.</p>
        </CardContent>
      </Card>
    </div>
  );
}
