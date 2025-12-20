import { useWhatsAppIntegrationPage } from '@/hooks/useWhatsAppIntegrationPage';
import { WhatsAppStatsCards, WhatsAppConfigForm } from '@/components/whatsapp';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, Send, RefreshCw, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function WhatsAppIntegration() {
  const {
    activeTab,
    setActiveTab,
    configData,
    setConfigData,
    testNumber,
    setTestNumber,
    testMessage,
    setTestMessage,
    selectedTemplate,
    setSelectedTemplate,
    messageFilter,
    setMessageFilter,
    messages,
    templates,
    stats,
    isLoadingMessages,
    isSavingConfig,
    isSendingTest,
    isSyncingTemplates,
    handleSaveConfig,
    handleSendTest,
    handleSyncTemplates,
  } = useWhatsAppIntegrationPage();

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      sent: 'secondary',
      delivered: 'default',
      read: 'default',
      failed: 'destructive',
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <PageHeader
        title="Integração WhatsApp"
        description="Configure e gerencie a integração com WhatsApp Business API"
      />

      <WhatsAppStatsCards stats={stats} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="config">Configuração</TabsTrigger>
          <TabsTrigger value="test">Teste</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="messages">Mensagens</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="mt-6">
          <WhatsAppConfigForm
            config={configData}
            onChange={setConfigData}
            onSave={handleSaveConfig}
            isSaving={isSavingConfig}
          />
        </TabsContent>

        <TabsContent value="test" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Enviar Mensagem de Teste</CardTitle>
              <CardDescription>Teste a integração enviando uma mensagem</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="testNumber">Número de Telefone</Label>
                  <Input
                    id="testNumber"
                    value={testNumber}
                    onChange={(e) => setTestNumber(e.target.value)}
                    placeholder="+5511999999999"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="template">Template (opcional)</Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Nenhum (mensagem livre)</SelectItem>
                      {templates.filter(t => t.status === 'approved').map((t) => (
                        <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {!selectedTemplate && (
                <div className="space-y-2">
                  <Label htmlFor="testMessage">Mensagem</Label>
                  <Textarea
                    id="testMessage"
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    rows={4}
                  />
                </div>
              )}

              <Button onClick={handleSendTest} disabled={isSendingTest}>
                {isSendingTest ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Enviar Teste
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Templates de Mensagem</CardTitle>
                <CardDescription>Templates aprovados pelo WhatsApp</CardDescription>
              </div>
              <Button variant="outline" onClick={handleSyncTemplates} disabled={isSyncingTemplates}>
                {isSyncingTemplates ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Sincronizar
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Idioma</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">{template.name}</TableCell>
                      <TableCell>{template.category}</TableCell>
                      <TableCell>{template.language}</TableCell>
                      <TableCell>
                        <Badge variant={template.status === 'approved' ? 'default' : 'secondary'}>
                          {template.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Histórico de Mensagens</CardTitle>
                <CardDescription>Mensagens enviadas recentemente</CardDescription>
              </div>
              <Select value={messageFilter} onValueChange={setMessageFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="sent">Enviadas</SelectItem>
                  <SelectItem value="delivered">Entregues</SelectItem>
                  <SelectItem value="read">Lidas</SelectItem>
                  <SelectItem value="failed">Falhas</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              {isLoadingMessages ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mb-2" />
                  <p>Nenhuma mensagem encontrada</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Para</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Conteúdo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {messages.map((msg) => (
                      <TableRow key={msg.id}>
                        <TableCell className="font-mono text-sm">{msg.to}</TableCell>
                        <TableCell>{msg.type}</TableCell>
                        <TableCell className="max-w-xs truncate">{msg.content}</TableCell>
                        <TableCell>{getStatusBadge(msg.status)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true, locale: ptBR })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
