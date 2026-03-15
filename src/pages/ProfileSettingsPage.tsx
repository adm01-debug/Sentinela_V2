import { useState } from 'react';
import { User, Mail, Phone, Building2, Save, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export default function ProfileSettingsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [name, setName] = useState(user?.user_metadata?.name || '');
  const [phone, setPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    setTimeout(() => {
      toast({ title: 'Perfil atualizado!' });
      setIsSaving(false);
    }, 500);
  };

  return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-2xl font-bold flex items-center gap-2"><User className="h-6 w-6 text-primary" />Configurações de Perfil</h1><p className="text-muted-foreground mt-1">Gerencie suas informações pessoais</p></div>
      <Card>
        <CardHeader><CardTitle>Informações Pessoais</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-16 w-16"><AvatarFallback className="text-xl">{name?.charAt(0) || user?.email?.charAt(0) || 'U'}</AvatarFallback></Avatar>
            <div><p className="font-medium">{name || 'Usuário'}</p><p className="text-sm text-muted-foreground">{user?.email}</p></div>
          </div>
          <div><Label>Nome</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
          <div><Label>Email</Label><Input value={user?.email || ''} disabled /></div>
          <div><Label>Telefone</Label><Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="(11) 99999-9999" /></div>
          <Button onClick={handleSave} disabled={isSaving}>{isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}{isSaving ? 'Salvando...' : 'Salvar'}</Button>
        </CardContent>
      </Card>
    </div>
  );
}

export { ProfileSettingsPage };
