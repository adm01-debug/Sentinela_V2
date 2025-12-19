import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { MessageCircle, Phone, Send, Settings, History, CheckCircle, XCircle, Clock, Plus, X, AlertTriangle, Info, Loader2 } from 'lucide-react';
import { useWhatsAppSettings } from '@/hooks/useWhatsAppSettings';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function WhatsAppIntegration() {
  const { settings, isLoading, messageLogs, logsLoading, saveSettings, sendTestMessage } = useWhatsAppSettings();

  const [enabled, setEnabled] = useState(false);
  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [recipientNumbers, setRecipientNumbers] = useState<string[]>([]);
  const [newNumber, setNewNumber] = useState('');
  const [notifyCritical, setNotifyCritical] = useState(true);
  const [notifyHigh, setNotifyHigh] = useState(true);
  const [notifyMedium, setNotifyMedium] = useState(false);
  const [notifyLow, setNotifyLow] = useState(false);
  const [testNumber, setTestNumber] = useState('');

  useEffect(() => {
    if (settings) {
      setEnabled(settings.enabled);
      setPhoneNumberId(settings.phone_number_id || '');
      setRecipientNumbers(settings.recipient_numbers || []);
      setNotifyCritical(settings.notify_critical);
      setNotifyHigh(settings.notify_high);
      setNotifyMedium(settings.notify_medium);
      setNotifyLow(settings.notify_low);
    }
  }, [settings]);

  const handleAddNumber = () => {
    if (newNumber && !recipientNumbers.includes(newNumber)) {
      setRecipientNumbers([...recipientNumbers, newNumber]);
      setNewNumber('');
    }
  };

  const handleRemoveNumber = (number: string) => {
    setRecipientNumbers(recipientNumbers.filter(n => n !== number));
  };

  const handleSave = () => {
    saveSettings.mutate({
      enabled,
      phone_number_id: phoneNumberId,
      recipient_numbers: recipientNumbers,
      notify_critical: notifyCritical,
      notify_high: notifyHigh,
      notify_medium: notifyMedium,
      notify_low: notifyLow,
    });
  };

  const handleSendTest = () => {
    if (testNumber) {
      sendTestMessage.mutate(testNumber);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> Enviado</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Falhou</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> Pendente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const stats = {
    total: messageLogs.length,
    sent: messageLogs.filter(l => l.status === 'sent').length,
    failed: messageLogs.filter(l => l.status === 'failed').length,
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <MessageCircle className="w-8 h-8 text-green-500" />
              Integração WhatsApp Business
            </h1>
            <p className="text-muted-foreground mt-1">
              Configure alertas via WhatsApp para violações de segurança
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="text-2xl font-bold">{enabled ? 'Ativo' : 'Inativo'}</p>
                  </div>
                  <div className={`p-3 rounded-full ${enabled ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <MessageCircle className={`w-6 h-6 ${enabled ? 'text-green-600' : 'text-gray-400'}`} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Destinatários</p>
                    <p className="text-2xl font-bold">{recipientNumbers.length}</p>
                  </div>
                  <div className="p-3 rounded-full bg-blue-100">
                    <Phone className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Enviadas</p>
                    <p className="text-2xl font-bold">{stats.sent}</p>
                  </div>
                  <div className="p-3 rounded-full bg-green-100">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Falhas</p>
                    <p className="text-2xl font-bold">{stats.failed}</p>
                  </div>
                  <div className="p-3 rounded-full bg-red-100">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="settings" className="space-y-6">
            <TabsList>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" /> Configurações
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="w-4 h-4" /> Histórico
              </TabsTrigger>
              <TabsTrigger value="docs" className="flex items-center gap-2">
                <Info className="w-4 h-4" /> Documentação
              </TabsTrigger>
            </TabsList>

            <TabsContent value="settings" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Main Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Configurações Gerais</CardTitle>
                    <CardDescription>
                      Configure a conexão com o WhatsApp Business API
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="enabled" className="text-base">Habilitar Integração</Label>
                        <p className="text-sm text-muted-foreground">
                          Ativar envio de alertas via WhatsApp
                        </p>
                      </div>
                      <Switch
                        id="enabled"
                        checked={enabled}
                        onCheckedChange={setEnabled}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label htmlFor="phone_number_id">Phone Number ID</Label>
                      <Input
                        id="phone_number_id"
                        value={phoneNumberId}
                        onChange={(e) => setPhoneNumberId(e.target.value)}
                        placeholder="Ex: 123456789012345"
                      />
                      <p className="text-xs text-muted-foreground">
                        ID do número de telefone do WhatsApp Business
                      </p>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <Label>Níveis de Severidade</Label>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500" />
                            <span>Crítico</span>
                          </div>
                          <Switch checked={notifyCritical} onCheckedChange={setNotifyCritical} />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-orange-500" />
                            <span>Alto</span>
                          </div>
                          <Switch checked={notifyHigh} onCheckedChange={setNotifyHigh} />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-yellow-500" />
                            <span>Médio</span>
                          </div>
                          <Switch checked={notifyMedium} onCheckedChange={setNotifyMedium} />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500" />
                            <span>Baixo</span>
                          </div>
                          <Switch checked={notifyLow} onCheckedChange={setNotifyLow} />
                        </div>
                      </div>
                    </div>

                    <Button 
                      onClick={handleSave} 
                      className="w-full"
                      disabled={saveSettings.isPending}
                    >
                      {saveSettings.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : null}
                      Salvar Configurações
                    </Button>
                  </CardContent>
                </Card>

                {/* Recipients */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Destinatários</CardTitle>
                      <CardDescription>
                        Números que receberão os alertas
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-2">
                        <Input
                          value={newNumber}
                          onChange={(e) => setNewNumber(e.target.value)}
                          placeholder="+55 11 99999-9999"
                          onKeyDown={(e) => e.key === 'Enter' && handleAddNumber()}
                        />
                        <Button onClick={handleAddNumber} size="icon">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>

                      <ScrollArea className="h-[200px]">
                        <div className="space-y-2">
                          {recipientNumbers.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              Nenhum destinatário adicionado
                            </p>
                          ) : (
                            recipientNumbers.map((number) => (
                              <div
                                key={number}
                                className="flex items-center justify-between p-3 rounded-lg border"
                              >
                                <div className="flex items-center gap-2">
                                  <Phone className="w-4 h-4 text-muted-foreground" />
                                  <span>{number}</span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveNumber(number)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ))
                          )}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  {/* Test Message */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Enviar Mensagem de Teste</CardTitle>
                      <CardDescription>
                        Verifique se a integração está funcionando
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="test_number">Número de Teste</Label>
                        <Input
                          id="test_number"
                          value={testNumber}
                          onChange={(e) => setTestNumber(e.target.value)}
                          placeholder="+55 11 99999-9999"
                        />
                      </div>
                      <Button 
                        onClick={handleSendTest}
                        disabled={!phoneNumberId || !testNumber || sendTestMessage.isPending}
                        className="w-full"
                      >
                        {sendTestMessage.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4 mr-2" />
                        )}
                        Enviar Teste
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Mensagens</CardTitle>
                  <CardDescription>
                    Últimas 100 mensagens enviadas via WhatsApp
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data/Hora</TableHead>
                          <TableHead>Destinatário</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Mensagem</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {logsLoading ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8">
                              <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                            </TableCell>
                          </TableRow>
                        ) : messageLogs.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                              Nenhuma mensagem enviada ainda
                            </TableCell>
                          </TableRow>
                        ) : (
                          messageLogs.map((log) => (
                            <TableRow key={log.id}>
                              <TableCell className="whitespace-nowrap">
                                {format(new Date(log.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                              </TableCell>
                              <TableCell>{log.recipient_number}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{log.message_type}</Badge>
                              </TableCell>
                              <TableCell>{getStatusBadge(log.status)}</TableCell>
                              <TableCell className="max-w-[300px] truncate">
                                {log.message_content}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="docs">
              <Card>
                <CardHeader>
                  <CardTitle>Documentação</CardTitle>
                  <CardDescription>
                    Como configurar a integração com WhatsApp Business API
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 rounded-lg border bg-yellow-50 border-yellow-200">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-yellow-800">Pré-requisitos</p>
                        <p className="text-sm text-yellow-700">
                          Você precisa de uma conta Meta Business e acesso ao WhatsApp Business API.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="font-semibold">1. Criar App no Meta for Developers</h3>
                      <p className="text-sm text-muted-foreground">
                        Acesse developers.facebook.com e crie um novo app do tipo "Business".
                        Adicione o produto "WhatsApp" ao seu app.
                      </p>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <h3 className="font-semibold">2. Obter Phone Number ID</h3>
                      <p className="text-sm text-muted-foreground">
                        No painel do WhatsApp, vá em "Getting Started" e copie o "Phone number ID".
                        Este ID é diferente do número de telefone em si.
                      </p>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <h3 className="font-semibold">3. Configurar Access Token</h3>
                      <p className="text-sm text-muted-foreground">
                        O token de acesso já foi configurado. Para atualizar, vá em Configurações {'>'}
                        Segredos e atualize o WHATSAPP_ACCESS_TOKEN.
                      </p>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <h3 className="font-semibold">4. Adicionar Destinatários</h3>
                      <p className="text-sm text-muted-foreground">
                        Adicione os números de telefone que devem receber os alertas.
                        Use o formato internacional com código do país (ex: +5511999999999).
                      </p>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <h3 className="font-semibold">Formato da Mensagem de Alerta</h3>
                      <div className="p-4 rounded-lg bg-muted font-mono text-sm">
                        <p>🔴 *ALERTA DE VIOLAÇÃO*</p>
                        <p className="mt-2">👤 Funcionário: João Silva</p>
                        <p>📋 Tipo: Acesso não autorizado</p>
                        <p>⚠️ Severidade: CRÍTICO</p>
                        <p>📝 Descrição: Tentativa de acesso...</p>
                        <p>🕐 Data/Hora: 19/12/2024 14:30</p>
                        <p className="mt-2">---</p>
                        <p>Sistema de Monitoramento</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
