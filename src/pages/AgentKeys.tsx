import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Key, Plus, Copy, Trash2, RefreshCw, Loader2, Monitor, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AgentKey {
  id: string;
  key_name: string;
  agent_key: string;
  employee_name: string | null;
  device_name: string | null;
  is_active: boolean;
  last_seen_at: string | null;
  created_at: string;
}

export default function AgentKeys() {
  const [keys, setKeys] = useState<AgentKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [newDeviceName, setNewDeviceName] = useState('');

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      const { data, error } = await supabase
        .from('agent_keys')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setKeys(data || []);
    } catch (error) {
      console.error('Error fetching agent keys:', error);
      toast.error('Erro ao carregar chaves');
    } finally {
      setLoading(false);
    }
  };

  const createKey = async () => {
    if (!newKeyName.trim()) {
      toast.error('Nome da chave é obrigatório');
      return;
    }

    setCreating(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('agent_keys')
        .insert({
          key_name: newKeyName.trim(),
          employee_name: newEmployeeName.trim() || null,
          device_name: newDeviceName.trim() || null,
          created_by: userData.user?.id
        })
        .select()
        .single();

      if (error) throw error;

      setKeys([data, ...keys]);
      setDialogOpen(false);
      setNewKeyName('');
      setNewEmployeeName('');
      setNewDeviceName('');
      toast.success('Chave criada com sucesso');
    } catch (error) {
      console.error('Error creating key:', error);
      toast.error('Erro ao criar chave');
    } finally {
      setCreating(false);
    }
  };

  const toggleKeyStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('agent_keys')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      setKeys(keys.map(k => k.id === id ? { ...k, is_active: !currentStatus } : k));
      toast.success(currentStatus ? 'Chave desativada' : 'Chave ativada');
    } catch (error) {
      console.error('Error toggling key status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const deleteKey = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta chave?')) return;

    try {
      const { error } = await supabase
        .from('agent_keys')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setKeys(keys.filter(k => k.id !== id));
      toast.success('Chave excluída');
    } catch (error) {
      console.error('Error deleting key:', error);
      toast.error('Erro ao excluir chave');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Chave copiada para a área de transferência');
  };

  const regenerateKey = async (id: string) => {
    if (!confirm('Tem certeza que deseja regenerar esta chave? O agente precisará ser reconfigurado.')) return;

    try {
      // Generate new key using crypto
      const newKey = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      const { error } = await supabase
        .from('agent_keys')
        .update({ agent_key: newKey })
        .eq('id', id);

      if (error) throw error;

      setKeys(keys.map(k => k.id === id ? { ...k, agent_key: newKey } : k));
      toast.success('Chave regenerada com sucesso');
    } catch (error) {
      console.error('Error regenerating key:', error);
      toast.error('Erro ao regenerar chave');
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <Key className="h-8 w-8 text-primary" />
                  Chaves de Agentes
                </h1>
                <p className="text-muted-foreground mt-1">
                  Gerencie as chaves de autenticação para os agentes desktop
                </p>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Chave
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Nova Chave de Agente</DialogTitle>
                    <DialogDescription>
                      Crie uma nova chave para autenticar um agente desktop
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="keyName">Nome da Chave *</Label>
                      <Input
                        id="keyName"
                        placeholder="Ex: Escritório Principal"
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="employeeName">Nome do Colaborador (opcional)</Label>
                      <Input
                        id="employeeName"
                        placeholder="Ex: João Silva"
                        value={newEmployeeName}
                        onChange={(e) => setNewEmployeeName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deviceName">Nome do Dispositivo (opcional)</Label>
                      <Input
                        id="deviceName"
                        placeholder="Ex: DESKTOP-001"
                        value={newDeviceName}
                        onChange={(e) => setNewDeviceName(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={createKey} disabled={creating}>
                      {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Criar Chave
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Chaves Registradas</CardTitle>
                <CardDescription>
                  {keys.length} chave{keys.length !== 1 ? 's' : ''} registrada{keys.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : keys.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma chave criada ainda</p>
                    <p className="text-sm">Clique em "Nova Chave" para criar a primeira</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Chave</TableHead>
                        <TableHead>Colaborador</TableHead>
                        <TableHead>Dispositivo</TableHead>
                        <TableHead>Última Atividade</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {keys.map((key) => (
                        <TableRow key={key.id}>
                          <TableCell className="font-medium">{key.key_name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                                {key.agent_key.substring(0, 16)}...
                              </code>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => copyToClipboard(key.agent_key)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            {key.employee_name || (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {key.device_name ? (
                              <div className="flex items-center gap-1">
                                <Monitor className="h-3 w-3" />
                                {key.device_name}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {key.last_seen_at ? (
                              <div className="flex items-center gap-1 text-sm">
                                <Clock className="h-3 w-3" />
                                {format(new Date(key.last_seen_at), "dd/MM HH:mm", { locale: ptBR })}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">Nunca</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={key.is_active}
                                onCheckedChange={() => toggleKeyStatus(key.id, key.is_active)}
                              />
                              <Badge variant={key.is_active ? "default" : "secondary"}>
                                {key.is_active ? 'Ativa' : 'Inativa'}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => regenerateKey(key.id)}
                                title="Regenerar chave"
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => deleteKey(key.id)}
                                title="Excluir chave"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Instruções de Uso</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                <ol className="space-y-2 text-sm text-muted-foreground">
                  <li>Crie uma nova chave para cada dispositivo que será monitorado</li>
                  <li>Copie a chave gerada clicando no ícone de cópia</li>
                  <li>No agente desktop, cole a chave no campo de configuração</li>
                  <li>O agente começará a enviar dados automaticamente</li>
                  <li>Desative ou exclua chaves para revogar o acesso de um dispositivo</li>
                </ol>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
