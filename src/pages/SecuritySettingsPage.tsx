import { Shield, Key, Lock, Smartphone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { MFASettings } from '@/components/MFASettings';
import { BlockedIPsPanel } from '@/components/BlockedIPsPanel';

export default function SecuritySettingsPage() {
  const { toast } = useToast();

  return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-2xl font-bold flex items-center gap-2"><Shield className="h-6 w-6 text-primary" />Configurações de Segurança</h1><p className="text-muted-foreground mt-1">Configure autenticação e segurança da conta</p></div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Key className="h-5 w-5" />Alterar Senha</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><Label>Senha Atual</Label><Input type="password" /></div>
          <div><Label>Nova Senha</Label><Input type="password" /></div>
          <div><Label>Confirmar Nova Senha</Label><Input type="password" /></div>
          <Button onClick={() => toast({ title: 'Senha atualizada!' })}>Alterar Senha</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Smartphone className="h-5 w-5" />Autenticação MFA</CardTitle></CardHeader>
        <CardContent><MFASettings /></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5" />IPs Bloqueados</CardTitle></CardHeader>
        <CardContent><BlockedIPsPanel /></CardContent>
      </Card>
    </div>
  );
}

export { SecuritySettingsPage };
