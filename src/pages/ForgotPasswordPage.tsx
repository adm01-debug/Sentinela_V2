import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, ArrowLeft } from 'lucide-react';
import { Button  } from '@/components/ui/button';
import { Input  } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter  } from '@/components/ui/card';
import { authService } from '@/services/authService';

const schema = z.object({ email: z.string().email('Email inválido') });
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      await authService.forgotPassword(data.email);
      setSent(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Email enviado!</CardTitle>
            <CardDescription>Verifique sua caixa de entrada para redefinir sua senha.</CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Link to="/login"><Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" />Voltar ao login</Button></Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Esqueceu a senha?</CardTitle>
          <CardDescription>Digite seu email para receber as instruções</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent><Input label="Email" type="email" {...register('email')} error={errors.email?.message} /></CardContent>
          <CardFooter className="flex-col gap-4">
            <Button type="submit" className="w-full" loading={isLoading}>Enviar instruções</Button>
            <Link to="/login" className="text-sm text-muted-foreground hover:text-primary">Voltar ao login</Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
