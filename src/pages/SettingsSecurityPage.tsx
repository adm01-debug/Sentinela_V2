import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Shield, Key, Smartphone, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useChangePassword } from '@/hooks/useAuth';

export default function SettingsSecurityPage() {
  const [twoFA, setTwoFA] = useState(false);
  const changePassword = useChangePassword();
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = async (data: any) => {
    await changePassword.mutateAsync(data);
    reset();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Key className="h-5 w-5" />Alterar Senha</CardTitle>
          <CardDescription>Atualize sua senha regularmente para manter sua conta segura</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <Input type="password" {...register('currentPassword')} placeholder="Senha atual" />
            <Input type="password" {...register('newPassword')} placeholder="Nova senha" />
            <Input type="password" {...register('confirmPassword')} placeholder="Confirmar nova senha" />
          </CardContent>
          <CardFooter><Button type="submit">Alterar senha</Button></CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Smartphone className="h-5 w-5" />Autenticação de dois fatores</CardTitle>
          <CardDescription>Adicione uma camada extra de segurança</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div><p className="font-medium">2FA via aplicativo</p><p className="text-sm text-muted-foreground">Use um app como Google Authenticator</p></div>
          <Switch checked={twoFA} onCheckedChange={setTwoFA} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><History className="h-5 w-5" />Sessões ativas</CardTitle>
          <CardDescription>Gerencie onde você está conectado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div><p className="font-medium">Este dispositivo</p><p className="text-sm text-muted-foreground">Chrome · São Paulo, BR</p></div>
              <span className="text-sm text-green-600">Ativo agora</span>
            </div>
          </div>
        </CardContent>
        <CardFooter><Button variant="outline">Encerrar todas as outras sessões</Button></CardFooter>
      </Card>
    </div>
  );
}
