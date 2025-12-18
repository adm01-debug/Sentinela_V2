import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  AlertTriangle,
  Eye,
  EyeOff,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Sidebar } from '@/components/Sidebar';
import { useViolationRules, severityLabels, ViolationRule } from '@/hooks/useViolationRules';
import { Loader2 } from 'lucide-react';

const severityColors: Record<string, string> = {
  low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  critical: 'bg-red-500/20 text-red-400 border-red-500/30'
};

interface KeywordFormData {
  rule_value: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  is_active: boolean;
  notify_employee: boolean;
  notify_admin: boolean;
}

const defaultFormData: KeywordFormData = {
  rule_value: '',
  description: '',
  severity: 'medium',
  is_active: true,
  notify_employee: true,
  notify_admin: true
};

export default function SensitiveKeywords() {
  const navigate = useNavigate();
  const { rules, loading, addRule, updateRule, deleteRule, toggleRule } = useViolationRules();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<ViolationRule | null>(null);
  const [formData, setFormData] = useState<KeywordFormData>(defaultFormData);

  // Filter only blocked_keyword rules
  const keywordRules = rules.filter(r => r.rule_type === 'blocked_keyword');
  
  const filteredKeywords = keywordRules.filter(rule => 
    rule.rule_value.toLowerCase().includes(search.toLowerCase()) ||
    (rule.description?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  const resetForm = () => {
    setFormData(defaultFormData);
    setEditingRule(null);
  };

  const openEditDialog = (rule: ViolationRule) => {
    setEditingRule(rule);
    setFormData({
      rule_value: rule.rule_value,
      description: rule.description || '',
      severity: rule.severity,
      is_active: rule.is_active,
      notify_employee: rule.notify_employee,
      notify_admin: rule.notify_admin
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.rule_value.trim()) return;

    const success = editingRule
      ? await updateRule(editingRule.id, formData)
      : await addRule({ ...formData, rule_type: 'blocked_keyword' });

    if (success) {
      setDialogOpen(false);
      resetForm();
    }
  };

  const stats = {
    total: keywordRules.length,
    active: keywordRules.filter(r => r.is_active).length,
    critical: keywordRules.filter(r => r.severity === 'critical').length,
    high: keywordRules.filter(r => r.severity === 'high').length
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 ml-64 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Palavras-Chave Sensíveis</h1>
              <p className="text-muted-foreground mt-1">
                Configure palavras detectadas automaticamente via OCR nas capturas de tela
              </p>
            </div>
          </div>

          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nova Palavra-Chave
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingRule ? 'Editar Palavra-Chave' : 'Adicionar Palavra-Chave'}
                </DialogTitle>
                <DialogDescription>
                  Palavras-chave são detectadas automaticamente no texto extraído das capturas de tela via OCR.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="keyword">Palavra ou Frase</Label>
                  <Input
                    id="keyword"
                    placeholder="Ex: confidencial, senha, cartão de crédito"
                    value={formData.rule_value}
                    onChange={(e) => setFormData({ ...formData, rule_value: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    A detecção não diferencia maiúsculas de minúsculas
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição (opcional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Ex: Detecta documentos confidenciais sendo visualizados"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Severidade</Label>
                  <Select
                    value={formData.severity}
                    onValueChange={(v) => setFormData({ ...formData, severity: v as KeywordFormData['severity'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="critical">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="active" className="cursor-pointer">Regra Ativa</Label>
                    </div>
                    <Switch
                      id="active"
                      checked={formData.is_active}
                      onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="notify-employee" className="cursor-pointer">Notificar Funcionário</Label>
                    </div>
                    <Switch
                      id="notify-employee"
                      checked={formData.notify_employee}
                      onCheckedChange={(v) => setFormData({ ...formData, notify_employee: v })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="notify-admin" className="cursor-pointer">Notificar Admin</Label>
                    </div>
                    <Switch
                      id="notify-admin"
                      checked={formData.notify_admin}
                      onCheckedChange={(v) => setFormData({ ...formData, notify_admin: v })}
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmit} disabled={!formData.rule_value.trim()}>
                  {editingRule ? 'Salvar' : 'Adicionar'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total de Palavras</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-400">{stats.active}</div>
              <div className="text-sm text-muted-foreground">Ativas</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-400">{stats.critical}</div>
              <div className="text-sm text-muted-foreground">Críticas</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-400">{stats.high}</div>
              <div className="text-sm text-muted-foreground">Alta Severidade</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar palavras-chave..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Keywords List */}
        <Card>
          <CardHeader>
            <CardTitle>Palavras-Chave Configuradas</CardTitle>
            <CardDescription>
              Quando detectadas via OCR nas capturas de tela, uma violação será criada automaticamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredKeywords.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {search ? (
                  <p>Nenhuma palavra-chave encontrada para "{search}"</p>
                ) : (
                  <div>
                    <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma palavra-chave configurada</p>
                    <p className="text-sm mt-2">Clique em "Nova Palavra-Chave" para adicionar</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredKeywords.map((rule) => (
                  <div 
                    key={rule.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Switch
                        checked={rule.is_active}
                        onCheckedChange={(checked) => toggleRule(rule.id, checked)}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`font-mono font-semibold ${!rule.is_active && 'text-muted-foreground'}`}>
                            {rule.rule_value}
                          </span>
                          <Badge className={severityColors[rule.severity]}>
                            {severityLabels[rule.severity]}
                          </Badge>
                          {!rule.is_active && (
                            <Badge variant="outline" className="text-muted-foreground">
                              <EyeOff className="h-3 w-3 mr-1" />
                              Inativa
                            </Badge>
                          )}
                        </div>
                        {rule.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {rule.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          {rule.notify_employee && (
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              Notifica funcionário
                            </span>
                          )}
                          {rule.notify_admin && (
                            <span className="flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              Notifica admin
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => openEditDialog(rule)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remover palavra-chave?</AlertDialogTitle>
                            <AlertDialogDescription>
                              A palavra "{rule.rule_value}" será removida permanentemente. Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteRule(rule.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Remover
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Como funciona?</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>1.</strong> O agente desktop captura screenshots periodicamente das estações monitoradas.
            </p>
            <p>
              <strong>2.</strong> Cada screenshot passa por OCR (reconhecimento óptico de caracteres) para extrair o texto visível.
            </p>
            <p>
              <strong>3.</strong> O texto extraído é comparado com as palavras-chave configuradas aqui.
            </p>
            <p>
              <strong>4.</strong> Quando uma palavra-chave é detectada, uma violação de segurança é criada automaticamente com a screenshot como evidência.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
