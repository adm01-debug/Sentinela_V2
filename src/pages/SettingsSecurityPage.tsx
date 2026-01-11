import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Shield, Key, Smartphone, History } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch';
import { useChangePassword, useToggle2FA } from '@/hooks/useAuth';

export default function SettingsSecurityPage() {
  const [twoFA, setTwoFA] = useState(false);
  const changePassword = useChangePassword();
  const toggle2FA = useToggle2FA();
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
            <Input label="Senha atual" type="password" {...register('currentPassword')} />
            <Input label="Nova senha" type="password" {...register('newPassword')} />
            <Input label="Confirmar nova senha" type="password" {...register('confirmPassword')} />
          </CardContent>
          <CardFooter><Button type="submit" loading={changePassword.isPending}>Alterar senha</Button></CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Smartphone className="h-5 w-5" />Autenticação de dois fatores</CardTitle>
          <CardDescription>Adicione uma camada extra de segurança</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div><p className="font-medium">2FA via aplicativo</p><p className="text-sm text-muted-foreground">Use um app como Google Authenticator</p></div>
          <Switch checked={twoFA} onCheckedChange={v => { setTwoFA(v); toggle2FA.mutate(v); }} />
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