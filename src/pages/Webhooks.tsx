import React, { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useWebhooks, WEBHOOK_EVENTS, Webhook, WebhookLog } from '@/hooks/useWebhooks';
import { 
  Webhook as WebhookIcon, 
  Plus, 
  Trash2, 
  Edit, 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw,
  Eye,
  Copy,
  ExternalLink,
  History,
  Settings2,
  Zap
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Webhooks() {
  const { webhooks, logs, loading, logsLoading, fetchWebhooks, fetchLogs, createWebhook, updateWebhook, deleteWebhook, testWebhook } = useWebhooks();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLogsDialogOpen, setIsLogsDialogOpen] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);
  const [testingWebhookId, setTestingWebhookId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    secret: '',
    events: [] as string[],
    headers: {} as Record<string, string>,
    is_active: true,
    retry_count: 3,
    timeout_seconds: 30,
  });

  const [headerKey, setHeaderKey] = useState('');
  const [headerValue, setHeaderValue] = useState('');

  const resetForm = () => {
    setFormData({
      name: '',
      url: '',
      secret: '',
      events: [],
      headers: {},
      is_active: true,
      retry_count: 3,
      timeout_seconds: 30,
    });
    setHeaderKey('');
    setHeaderValue('');
  };

  const handleCreateWebhook = async () => {
    if (!formData.name || !formData.url || formData.events.length === 0) return;
    
    await createWebhook(formData);
    setIsCreateDialogOpen(false);
    resetForm();
  };

  const handleEditWebhook = async () => {
    if (!selectedWebhook || !formData.name || !formData.url || formData.events.length === 0) return;
    
    await updateWebhook(selectedWebhook.id, formData);
    setIsEditDialogOpen(false);
    setSelectedWebhook(null);
    resetForm();
  };

  const handleDeleteWebhook = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este webhook?')) {
      await deleteWebhook(id);
    }
  };

  const handleTestWebhook = async (webhook: Webhook) => {
    if (webhook.events.length === 0) return;
    
    setTestingWebhookId(webhook.id);
    await testWebhook(webhook.id, webhook.events[0]);
    setTestingWebhookId(null);
  };

  const handleViewLogs = async (webhook: Webhook) => {
    setSelectedWebhook(webhook);
    await fetchLogs(webhook.id);
    setIsLogsDialogOpen(true);
  };

  const openEditDialog = (webhook: Webhook) => {
    setSelectedWebhook(webhook);
    setFormData({
      name: webhook.name,
      url: webhook.url,
      secret: webhook.secret || '',
      events: webhook.events,
      headers: webhook.headers || {},
      is_active: webhook.is_active,
      retry_count: webhook.retry_count,
      timeout_seconds: webhook.timeout_seconds,
    });
    setIsEditDialogOpen(true);
  };

  const addHeader = () => {
    if (headerKey && headerValue) {
      setFormData(prev => ({
        ...prev,
        headers: { ...prev.headers, [headerKey]: headerValue },
      }));
      setHeaderKey('');
      setHeaderValue('');
    }
  };

  const removeHeader = (key: string) => {
    setFormData(prev => {
      const { [key]: _, ...rest } = prev.headers;
      return { ...prev, headers: rest };
    });
  };

  const toggleEvent = (event: string) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter(e => e !== event)
        : [...prev.events, event],
    }));
  };

  const getStatusBadge = (status: string | null) => {
    if (!status) return <Badge variant="secondary">Nunca executado</Badge>;
    if (status === 'success') return <Badge className="bg-green-500">Sucesso</Badge>;
    if (status === 'failed') return <Badge variant="destructive">Falhou</Badge>;
    return <Badge variant="secondary">{status}</Badge>;
  };

  const getLogStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'retrying':
        return <RefreshCw className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const WebhookFormContent = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Meu Webhook"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="url">URL</Label>
          <Input
            id="url"
            value={formData.url}
            onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
            placeholder="https://example.com/webhook"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="secret">Secret (opcional)</Label>
        <Input
          id="secret"
          type="password"
          value={formData.secret}
          onChange={(e) => setFormData(prev => ({ ...prev, secret: e.target.value }))}
          placeholder="Usado para assinar as requisições"
        />
        <p className="text-xs text-muted-foreground">
          Se fornecido, as requisições serão assinadas com HMAC-SHA256 no header X-Webhook-Signature
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="retry_count">Tentativas</Label>
          <Select
            value={formData.retry_count.toString()}
            onValueChange={(value) => setFormData(prev => ({ ...prev, retry_count: parseInt(value) }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5].map(n => (
                <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="timeout_seconds">Timeout (segundos)</Label>
          <Select
            value={formData.timeout_seconds.toString()}
            onValueChange={(value) => setFormData(prev => ({ ...prev, timeout_seconds: parseInt(value) }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 15, 30, 45, 60].map(n => (
                <SelectItem key={n} value={n.toString()}>{n}s</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Eventos</Label>
        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-md p-3">
          {WEBHOOK_EVENTS.map(event => (
            <div key={event.value} className="flex items-start space-x-2">
              <Checkbox
                id={event.value}
                checked={formData.events.includes(event.value)}
                onCheckedChange={() => toggleEvent(event.value)}
              />
              <div className="grid gap-0.5 leading-none">
                <label htmlFor={event.value} className="text-sm font-medium cursor-pointer">
                  {event.label}
                </label>
                <p className="text-xs text-muted-foreground">{event.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Headers Customizados</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Header"
            value={headerKey}
            onChange={(e) => setHeaderKey(e.target.value)}
          />
          <Input
            placeholder="Valor"
            value={headerValue}
            onChange={(e) => setHeaderValue(e.target.value)}
          />
          <Button type="button" variant="outline" onClick={addHeader}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {Object.keys(formData.headers).length > 0 && (
          <div className="space-y-1">
            {Object.entries(formData.headers).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between bg-muted rounded px-2 py-1">
                <span className="text-sm"><strong>{key}:</strong> {value}</span>
                <Button variant="ghost" size="icon" onClick={() => removeHeader(key)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
        />
        <Label htmlFor="is_active">Ativo</Label>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  <WebhookIcon className="h-8 w-8" />
                  Webhooks
                </h1>
                <p className="text-muted-foreground mt-1">
                  Configure webhooks para integrar com sistemas externos
                </p>
              </div>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Webhook
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Criar Webhook</DialogTitle>
                    <DialogDescription>
                      Configure um novo webhook para receber notificações de eventos
                    </DialogDescription>
                  </DialogHeader>
                  <WebhookFormContent />
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleCreateWebhook} disabled={!formData.name || !formData.url || formData.events.length === 0}>
                      Criar Webhook
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Webhooks</p>
                      <p className="text-2xl font-bold">{webhooks.length}</p>
                    </div>
                    <WebhookIcon className="h-8 w-8 text-primary opacity-50" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Ativos</p>
                      <p className="text-2xl font-bold">{webhooks.filter(w => w.is_active).length}</p>
                    </div>
                    <Zap className="h-8 w-8 text-green-500 opacity-50" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Com Sucesso</p>
                      <p className="text-2xl font-bold">{webhooks.filter(w => w.last_status === 'success').length}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-500 opacity-50" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Com Falha</p>
                      <p className="text-2xl font-bold">{webhooks.filter(w => w.last_status === 'failed').length}</p>
                    </div>
                    <XCircle className="h-8 w-8 text-red-500 opacity-50" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Webhooks List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings2 className="h-5 w-5" />
                  Webhooks Configurados
                </CardTitle>
                <CardDescription>
                  Gerencie seus webhooks e monitore suas execuções
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : webhooks.length === 0 ? (
                  <div className="text-center py-12">
                    <WebhookIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">Nenhum webhook configurado</h3>
                    <p className="text-muted-foreground mb-4">
                      Crie um webhook para começar a receber notificações
                    </p>
                    <Button onClick={() => { resetForm(); setIsCreateDialogOpen(true); }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Webhook
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {webhooks.map(webhook => (
                      <div
                        key={webhook.id}
                        className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{webhook.name}</h3>
                              {!webhook.is_active && (
                                <Badge variant="secondary">Inativo</Badge>
                              )}
                              {getStatusBadge(webhook.last_status)}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <ExternalLink className="h-3 w-3" />
                              <span className="truncate max-w-md">{webhook.url}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => copyToClipboard(webhook.url)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {webhook.events.map(event => {
                                const eventInfo = WEBHOOK_EVENTS.find(e => e.value === event);
                                return (
                                  <Badge key={event} variant="outline" className="text-xs">
                                    {eventInfo?.label || event}
                                  </Badge>
                                );
                              })}
                            </div>
                            {webhook.last_triggered_at && (
                              <p className="text-xs text-muted-foreground mt-2">
                                Última execução: {format(new Date(webhook.last_triggered_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                                {webhook.last_response_code && ` (${webhook.last_response_code})`}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewLogs(webhook)}
                            >
                              <History className="h-4 w-4 mr-1" />
                              Logs
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleTestWebhook(webhook)}
                              disabled={testingWebhookId === webhook.id || webhook.events.length === 0}
                            >
                              {testingWebhookId === webhook.id ? (
                                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                              ) : (
                                <Play className="h-4 w-4 mr-1" />
                              )}
                              Testar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(webhook)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteWebhook(webhook.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Documentation */}
            <Card>
              <CardHeader>
                <CardTitle>Documentação</CardTitle>
                <CardDescription>
                  Como usar os webhooks
                </CardDescription>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Headers de Requisição</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li><code>Content-Type: application/json</code></li>
                      <li><code>X-Webhook-Event: &lt;event_type&gt;</code></li>
                      <li><code>X-Webhook-Timestamp: &lt;ISO timestamp&gt;</code></li>
                      <li><code>X-Webhook-Attempt: &lt;attempt number&gt;</code></li>
                      <li><code>X-Webhook-Signature: sha256=&lt;signature&gt;</code> (se secret configurado)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Formato do Payload</h4>
                    <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto">
{`{
  "event_type": "violation.created",
  "data": {
    // dados do evento
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}`}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Webhook</DialogTitle>
            <DialogDescription>
              Atualize as configurações do webhook
            </DialogDescription>
          </DialogHeader>
          <WebhookFormContent />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditWebhook} disabled={!formData.name || !formData.url || formData.events.length === 0}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Logs Dialog */}
      <Dialog open={isLogsDialogOpen} onOpenChange={setIsLogsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Logs do Webhook: {selectedWebhook?.name}</DialogTitle>
            <DialogDescription>
              Histórico de execuções do webhook
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh]">
            {logsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8">
                <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhum log encontrado</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Evento</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Duração</TableHead>
                    <TableHead>Tentativa</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map(log => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getLogStatusIcon(log.status)}
                          <span className="capitalize">{log.status}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {WEBHOOK_EVENTS.find(e => e.value === log.event_type)?.label || log.event_type}
                        </Badge>
                      </TableCell>
                      <TableCell>{log.response_code || '-'}</TableCell>
                      <TableCell>{log.duration_ms ? `${log.duration_ms}ms` : '-'}</TableCell>
                      <TableCell>{log.attempt_number}</TableCell>
                      <TableCell>
                        {format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
