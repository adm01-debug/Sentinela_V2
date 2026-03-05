import { useState } from 'react';
import { Plus, Copy, Eye, EyeOff, Trash2, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/useToast';

interface ApiKey { id: string; name: string; key: string; createdAt: string; }

export default function SettingsAPIPage() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [showKey, setShowKey] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCreate = () => {
    const newKey: ApiKey = { id: crypto.randomUUID(), name, key: `sk_${crypto.randomUUID().replace(/-/g, '')}`, createdAt: new Date().toISOString() };
    setKeys(prev => [...prev, newKey]);
    setOpen(false);
    setName('');
  };

  const handleDelete = (id: string) => setKeys(prev => prev.filter(k => k.id !== id));

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
        <CardContent><code className="block p-4 bg-muted rounded-lg text-sm">https://api.sentinela.app/v1</code></CardContent>
      </Card>
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {keys.map(key => (
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
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(key.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nova Chave de API</DialogTitle></DialogHeader>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Integração CRM" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate}>Criar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
