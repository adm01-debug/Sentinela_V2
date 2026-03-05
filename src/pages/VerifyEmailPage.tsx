import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (!token) { setStatus('error'); return; }
    // Simulate verification
    setTimeout(() => setStatus('success'), 1500);
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          {status === 'loading' && (<><Loader2 className="mx-auto h-12 w-12 text-primary animate-spin mb-4" /><CardTitle>Verificando email...</CardTitle><CardDescription>Aguarde enquanto confirmamos seu email.</CardDescription></>)}
          {status === 'success' && (<><CheckCircle className="mx-auto h-12 w-12 text-primary mb-4" /><CardTitle>Email verificado!</CardTitle><CardDescription>Sua conta foi ativada com sucesso.</CardDescription></>)}
          {status === 'error' && (<><XCircle className="mx-auto h-12 w-12 text-destructive mb-4" /><CardTitle className="text-destructive">Erro na verificação</CardTitle><CardDescription>O link é inválido ou expirou.</CardDescription></>)}
        </CardHeader>
        <CardFooter className="justify-center"><Link to="/login"><Button>Ir para o login</Button></Link></CardFooter>
      </Card>
    </div>
  );
}
