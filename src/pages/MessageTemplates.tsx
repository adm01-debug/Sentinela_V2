import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Eye, 
  MessageCircle, 
  Mail, 
  Bell,
  Loader2,
  Code,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useMessageTemplates, MessageTemplate, TEMPLATE_TYPES, CHANNELS, AVAILABLE_VARIABLES, renderTemplate } from '@/hooks/useMessageTemplates';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function MessageTemplates() {
  const { templates, isLoading, createTemplate, updateTemplate, deleteTemplate, duplicateTemplate } = useMessageTemplates();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<MessageTemplate | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [templateType, setTemplateType] = useState('violation_alert');
  const [channel, setChannel] = useState('whatsapp');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isDefault, setIsDefault] = useState(false);

  const [filterChannel, setFilterChannel] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    if (editingTemplate) {
      setName(editingTemplate.name);
      setDescription(editingTemplate.description || '');
      setTemplateType(editingTemplate.template_type);
      setChannel(editingTemplate.channel);
      setSubject(editingTemplate.subject || '');
      setBody(editingTemplate.body);
      setIsActive(editingTemplate.is_active);
      setIsDefault(editingTemplate.is_default);
    } else {
      resetForm();
    }
  }, [editingTemplate]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setTemplateType('violation_alert');
    setChannel('whatsapp');
    setSubject('');
    setBody('');
    setIsActive(true);
    setIsDefault(false);
  };

  const handleOpenDialog = (template?: MessageTemplate) => {
    setEditingTemplate(template || null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTemplate(null);
    resetForm();
  };

  const handleSave = () => {
    const variables = extractVariables(body);
    
    if (editingTemplate) {
      updateTemplate.mutate({
        id: editingTemplate.id,
        name,
        description: description || null,
        template_type: templateType,
        channel,
        subject: subject || null,
        body,
        variables,
        is_active: isActive,
        is_default: isDefault,
      });
    } else {
      createTemplate.mutate({
        name,
        description: description || null,
        template_type: templateType,
        channel,
        subject: subject || null,
        body,
        variables,
        is_active: isActive,
        is_default: isDefault,
      });
    }
    handleCloseDialog();
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este template?')) {
      deleteTemplate.mutate(id);
    }
  };

  const handleDuplicate = (template: MessageTemplate) => {
    duplicateTemplate.mutate(template);
  };

  const handlePreview = (template: MessageTemplate) => {
    setPreviewTemplate(template);
    setPreviewOpen(true);
  };

  const insertVariable = (variable: string) => {
    setBody(prev => prev + `{{${variable}}}`);
  };

  const extractVariables = (text: string): string[] => {
    const matches = text.match(/\{\{([^}]+)\}\}/g) || [];
    return [...new Set(matches.map(m => m.replace(/[{}]/g, '')))];
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'whatsapp':
        return <MessageCircle className="w-4 h-4 text-green-500" />;
      case 'email':
        return <Mail className="w-4 h-4 text-blue-500" />;
      case 'push':
        return <Bell className="w-4 h-4 text-orange-500" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const filteredTemplates = templates.filter(t => {
    if (filterChannel !== 'all' && t.channel !== filterChannel) return false;
    if (filterType !== 'all' && t.template_type !== filterType) return false;
    return true;
  });

  const sampleVariables: Record<string, string> = {
    severity_emoji: '🔴',
    severity: 'CRÍTICO',
    employee_name: 'João Silva',
    violation_type: 'Acesso não autorizado',
    policy_name: 'Política de Segurança de Dados',
    description: 'Tentativa de acesso a arquivos confidenciais fora do horário permitido',
    device: 'DESKTOP-JOA01',
    location: 'São Paulo, SP',
    ip_address: '192.168.1.100',
    timestamp: format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR }),
    company_name: 'SecureWatch Corp',
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
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <FileText className="w-8 h-8 text-primary" />
                Templates de Mensagem
              </h1>
              <p className="text-muted-foreground mt-1">
                Gerencie templates personalizáveis para alertas e notificações
              </p>
            </div>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Template
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">{templates.length}</p>
                  </div>
                  <div className="p-3 rounded-full bg-primary/10">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">WhatsApp</p>
                    <p className="text-2xl font-bold">{templates.filter(t => t.channel === 'whatsapp').length}</p>
                  </div>
                  <div className="p-3 rounded-full bg-green-100">
                    <MessageCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="text-2xl font-bold">{templates.filter(t => t.channel === 'email').length}</p>
                  </div>
                  <div className="p-3 rounded-full bg-blue-100">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Ativos</p>
                    <p className="text-2xl font-bold">{templates.filter(t => t.is_active).length}</p>
                  </div>
                  <div className="p-3 rounded-full bg-green-100">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="w-48">
                  <Label>Canal</Label>
                  <Select value={filterChannel} onValueChange={setFilterChannel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os canais</SelectItem>
                      {CHANNELS.map(c => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-48">
                  <Label>Tipo</Label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      {TEMPLATE_TYPES.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Templates Table */}
          <Card>
            <CardHeader>
              <CardTitle>Templates ({filteredTemplates.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Canal</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Padrão</TableHead>
                      <TableHead>Atualizado</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTemplates.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{template.name}</p>
                            {template.description && (
                              <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                                {template.description}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getChannelIcon(template.channel)}
                            <span className="capitalize">{template.channel}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {TEMPLATE_TYPES.find(t => t.value === template.template_type)?.label || template.template_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {template.is_active ? (
                            <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                          ) : (
                            <Badge variant="secondary">Inativo</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {template.is_default && (
                            <Badge className="bg-blue-100 text-blue-800">Padrão</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(template.updated_at), "dd/MM/yyyy", { locale: ptBR })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => handlePreview(template)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(template)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDuplicate(template)}>
                              <Copy className="w-4 h-4" />
                            </Button>
                            {!template.is_default && (
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(template.id)}>
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Edit/Create Dialog */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingTemplate ? 'Editar Template' : 'Novo Template'}
                </DialogTitle>
                <DialogDescription>
                  {editingTemplate 
                    ? 'Modifique as configurações do template de mensagem'
                    : 'Crie um novo template de mensagem personalizado'}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do Template *</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Alerta de Violação Crítica"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Input
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Breve descrição do template"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tipo</Label>
                      <Select value={templateType} onValueChange={setTemplateType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TEMPLATE_TYPES.map(t => (
                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Canal</Label>
                      <Select value={channel} onValueChange={setChannel}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CHANNELS.map(c => (
                            <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {channel === 'email' && (
                    <div className="space-y-2">
                      <Label htmlFor="subject">Assunto do Email</Label>
                      <Input
                        id="subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="{{severity_emoji}} Alerta de Segurança"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="body">Corpo da Mensagem *</Label>
                    <Textarea
                      id="body"
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder="Digite o conteúdo da mensagem..."
                      className="min-h-[200px] font-mono text-sm"
                    />
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Switch checked={isActive} onCheckedChange={setIsActive} />
                      <Label>Ativo</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={isDefault} 
                        onCheckedChange={setIsDefault}
                        disabled={editingTemplate?.is_default}
                      />
                      <Label>Template Padrão</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="flex items-center gap-2 mb-2">
                      <Code className="w-4 h-4" />
                      Variáveis Disponíveis
                    </Label>
                    <Card>
                      <CardContent className="pt-4">
                        <ScrollArea className="h-[300px]">
                          <div className="space-y-2">
                            {AVAILABLE_VARIABLES.map((v) => (
                              <div
                                key={v.name}
                                className="flex items-center justify-between p-2 rounded-lg border hover:bg-accent cursor-pointer"
                                onClick={() => insertVariable(v.name)}
                              >
                                <div>
                                  <code className="text-sm font-mono text-primary">{`{{${v.name}}}`}</code>
                                  <p className="text-xs text-muted-foreground">{v.description}</p>
                                </div>
                                <Plus className="w-4 h-4 text-muted-foreground" />
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </div>

                  <div>
                    <Label className="flex items-center gap-2 mb-2">
                      <Eye className="w-4 h-4" />
                      Pré-visualização
                    </Label>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="p-3 rounded-lg bg-muted/50 whitespace-pre-wrap text-sm max-h-[150px] overflow-y-auto">
                          {body ? renderTemplate(body, sampleVariables) : 'Digite o corpo da mensagem para ver a pré-visualização...'}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={handleCloseDialog}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={!name || !body || createTemplate.isPending || updateTemplate.isPending}
                >
                  {(createTemplate.isPending || updateTemplate.isPending) && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {editingTemplate ? 'Salvar Alterações' : 'Criar Template'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Preview Dialog */}
          <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {previewTemplate && getChannelIcon(previewTemplate.channel)}
                  {previewTemplate?.name}
                </DialogTitle>
                <DialogDescription>
                  Pré-visualização com dados de exemplo
                </DialogDescription>
              </DialogHeader>

              {previewTemplate && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Badge variant="outline">
                      {TEMPLATE_TYPES.find(t => t.value === previewTemplate.template_type)?.label}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {previewTemplate.channel}
                    </Badge>
                    {previewTemplate.is_default && (
                      <Badge className="bg-blue-100 text-blue-800">Padrão</Badge>
                    )}
                  </div>

                  {previewTemplate.channel === 'email' && previewTemplate.subject && (
                    <div>
                      <Label className="text-muted-foreground">Assunto:</Label>
                      <p className="font-medium">{renderTemplate(previewTemplate.subject, sampleVariables)}</p>
                    </div>
                  )}

                  <Separator />

                  <div className="p-4 rounded-lg bg-muted/50">
                    {previewTemplate.channel === 'email' ? (
                      <div 
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ 
                          __html: renderTemplate(previewTemplate.body, sampleVariables) 
                        }}
                      />
                    ) : (
                      <pre className="whitespace-pre-wrap font-sans text-sm">
                        {renderTemplate(previewTemplate.body, sampleVariables)}
                      </pre>
                    )}
                  </div>

                  <div>
                    <Label className="text-muted-foreground text-xs">Variáveis utilizadas:</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {previewTemplate.variables.map(v => (
                        <Badge key={v} variant="secondary" className="text-xs">
                          {v}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setPreviewOpen(false)}>
                  Fechar
                </Button>
                <Button onClick={() => {
                  setPreviewOpen(false);
                  if (previewTemplate) handleOpenDialog(previewTemplate);
                }}>
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}
