import { Key, Lock, Smartphone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MFASettings } from '@/components/MFASettings';
import { BlockedIPsPanel } from '@/components/BlockedIPsPanel';
import { PageHeader } from '@/components/layout/PageHeader';
import { ChangePasswordForm } from '@/components/security/ChangePasswordForm';

export default function SecuritySettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurações de Segurança"
        description="Configure autenticação, senha e proteção da conta"
        showBackButton={false}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" aria-hidden="true" />
            Alterar senha
          </CardTitle>
          <CardDescription>
            Sua senha deve conter no mínimo 8 caracteres. Recomendamos combinar letras, números e
            símbolos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" aria-hidden="true" />
            Autenticação em duas etapas (MFA)
          </CardTitle>
          <CardDescription>
            Adicione uma camada extra de proteção usando um aplicativo autenticador.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MFASettings />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" aria-hidden="true" />
            IPs bloqueados
          </CardTitle>
          <CardDescription>
            Gerencie endereços de IP com acesso restrito à sua organização.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BlockedIPsPanel />
        </CardContent>
      </Card>
    </div>
  );
}

export { SecuritySettingsPage };
