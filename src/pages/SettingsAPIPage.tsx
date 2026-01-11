import { useState } from 'react';
import { Plus, Copy, Eye, EyeOff, Trash2, Key } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import { Badge } from '@/components/ui/Badge';
import { useApiKeys, useCreateApiKey, useDeleteApiKey } from '@/hooks/useApiKeys';
import { useToast } from '@/hooks/useToast';

export default function SettingsAPIPage() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [showKey, setShowKey] = useState<string | null>(null);
  const { data: keys } = useApiKeys();
  const createKey = useCreateApiKey();
  const deleteKey = useDeleteApiKey();
  const { toast } = useToast();

  const handleCreate = async () => {
    await createKey.mutateAsync({ name });
    setOpen(false);
    setName('');
  };

  const copyToClipboard = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({ title: 'Copiado!', description: 'Chave copiada para a área de transferência' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h2 className="text-xl font-bold">Chaves de API</h2><p className="text-muted-foreground">Gerencie suas chaves de acesso à API</p></div>
        <Button onClick={() => setOpen(true)}><Plus className="mr-2 h-4 w-4" />Nova Chave</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Key className="h-5 w-5" />Documentação</CardTitle>
          <CardDescription>Acesse nossa documentação para integrar com a API</CardDescription>
        </CardHeader>
        <CardContent>
          <code className="block p-4 bg-muted rounded-lg text-sm">https://api.sentinela.app/v1</code>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {keys?.map(key => (
              <div key={key.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{key.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-sm text-muted-foreground">{showKey === key.id ? key.key : '••••••••••••••••••••••••'}</code>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowKey(showKey === key.id ? null : key.id)}>
                      {showKey === key.id ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(key.key)}><Copy className="h-3 w-3" /></Button>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="secondary">Criada em {new Date(key.createdAt).toLocaleDateString()}</Badge>
                  <Button variant="ghost" size="icon" onClick={() => deleteKey.mutate(key.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nova Chave de API</DialogTitle></DialogHeader>
          <Input label="Nome da chave" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Integração CRM" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} loading={createKey.isPending}>Criar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}