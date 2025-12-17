import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Globe, 
  Type, 
  AppWindow, 
  FileType, 
  Clock,
  Trash2,
  Edit2,
  Bell,
  BellOff,
  Power,
  PowerOff,
  Loader2,
  AlertTriangle,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  useViolationRules, 
  type ViolationRule, 
  type ViolationRuleType,
  ruleTypeLabels,
  severityLabels 
} from '@/hooks/useViolationRules';

const ruleTypeIcons: Record<ViolationRuleType, typeof Globe> = {
  blocked_site: Globe,
  blocked_keyword: Type,
  blocked_app: AppWindow,
  blocked_file_extension: FileType,
  work_hours: Clock
};

const severityColors: Record<string, string> = {
  low: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
  medium: 'bg-warning/10 text-warning border-warning/30',
  high: 'bg-orange-500/10 text-orange-500 border-orange-500/30',
  critical: 'bg-destructive/10 text-destructive border-destructive/30'
};

export default function ViolationRules() {
  const navigate = useNavigate();
  const { rules, loading, addRule, updateRule, deleteRule, toggleRule } = useViolationRules();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<ViolationRuleType | 'all'>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<ViolationRule | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    rule_type: 'blocked_site' as ViolationRuleType,
    rule_value: '',
    description: '',
    severity: 'medium' as ViolationRule['severity'],
    is_active: true,
    notify_employee: true,
    notify_admin: true
  });

  const resetForm = () => {
    setFormData({
      rule_type: 'blocked_site',
      rule_value: '',
      description: '',
      severity: 'medium',
      is_active: true,
      notify_employee: true,
      notify_admin: true
    });
    setEditingRule(null);
  };

  const openEditDialog = (rule: ViolationRule) => {
    setEditingRule(rule);
    setFormData({
      rule_type: rule.rule_type,
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
    if (!formData.rule_value.trim()) {
      return;
    }

    let success: boolean;
    if (editingRule) {
      success = await updateRule(editingRule.id, formData);
    } else {
      success = await addRule(formData);
    }

    if (success) {
      setDialogOpen(false);
      resetForm();
    }
  };

  const filteredRules = rules.filter(rule => {
    const matchesSearch = rule.rule_value.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rule.description?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesTab = activeTab === 'all' || rule.rule_type === activeTab;
    return matchesSearch && matchesTab;
  });

  const getRuleTypePlaceholder = (type: ViolationRuleType) => {
    switch (type) {
      case 'blocked_site': return 'Ex: facebook.com, youtube.com';
      case 'blocked_keyword': return 'Ex: confidencial, senha, cartão';
      case 'blocked_app': return 'Ex: Discord, Steam, Spotify';
      case 'blocked_file_extension': return 'Ex: .exe, .torrent, .mp3';
      case 'work_hours': return 'Ex: 08:00-18:00';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center gap-4 px-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/settings')}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Regras de Violação</h1>
            <p className="text-sm text-muted-foreground">Configure o que é considerado uma violação</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nova Regra
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingRule ? 'Editar Regra' : 'Nova Regra de Violação'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Tipo de Regra</Label>
                  <Select
                    value={formData.rule_type}
                    onValueChange={(v) => setFormData(prev => ({ ...prev, rule_type: v as ViolationRuleType }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ruleTypeLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Valor</Label>
                  <Input
                    placeholder={getRuleTypePlaceholder(formData.rule_type)}
                    value={formData.rule_value}
                    onChange={(e) => setFormData(prev => ({ ...prev, rule_value: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Descrição (opcional)</Label>
                  <Textarea
                    placeholder="Descreva o motivo desta regra..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Severidade</Label>
                  <Select
                    value={formData.severity}
                    onValueChange={(v) => setFormData(prev => ({ ...prev, severity: v as ViolationRule['severity'] }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(severityLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Regra Ativa</Label>
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(v) => setFormData(prev => ({ ...prev, is_active: v }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Notificar Funcionário</Label>
                    <Switch
                      checked={formData.notify_employee}
                      onCheckedChange={(v) => setFormData(prev => ({ ...prev, notify_employee: v }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Notificar Admin</Label>
                    <Switch
                      checked={formData.notify_admin}
                      onCheckedChange={(v) => setFormData(prev => ({ ...prev, notify_admin: v }))}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmit} disabled={!formData.rule_value.trim()}>
                  {editingRule ? 'Salvar' : 'Criar Regra'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="container px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(ruleTypeLabels).map(([type, label]) => {
            const Icon = ruleTypeIcons[type as ViolationRuleType];
            const count = rules.filter(r => r.rule_type === type).length;
            const activeCount = rules.filter(r => r.rule_type === type && r.is_active).length;
            return (
              <div key={type} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{label}</span>
                </div>
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-xs text-muted-foreground">{activeCount} ativas</p>
              </div>
            );
          })}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar regras..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ViolationRuleType | 'all')}>
          <TabsList className="flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="all">Todas</TabsTrigger>
            {Object.entries(ruleTypeLabels).map(([key, label]) => (
              <TabsTrigger key={key} value={key} className="gap-1">
                {React.createElement(ruleTypeIcons[key as ViolationRuleType], { className: 'h-3 w-3' })}
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            <div className="rounded-xl border border-border bg-card">
              {filteredRules.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <AlertTriangle className="h-12 w-12 mb-4 opacity-50" />
                  <p>Nenhuma regra encontrada</p>
                  <Button 
                    variant="link" 
                    className="mt-2"
                    onClick={() => setDialogOpen(true)}
                  >
                    Criar primeira regra
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {filteredRules.map(rule => {
                    const Icon = ruleTypeIcons[rule.rule_type];
                    return (
                      <div 
                        key={rule.id} 
                        className={`p-4 flex items-center gap-4 ${!rule.is_active ? 'opacity-50' : ''}`}
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium truncate">{rule.rule_value}</span>
                            <Badge variant="outline" className={severityColors[rule.severity]}>
                              {severityLabels[rule.severity]}
                            </Badge>
                            {!rule.is_active && (
                              <Badge variant="secondary">Inativa</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span>{ruleTypeLabels[rule.rule_type]}</span>
                            {rule.description && (
                              <>
                                <span>•</span>
                                <span className="truncate">{rule.description}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 mr-2" title="Notificações">
                            {rule.notify_employee ? (
                              <Bell className="h-4 w-4 text-primary" />
                            ) : (
                              <BellOff className="h-4 w-4 text-muted-foreground" />
                            )}
                            {rule.notify_admin ? (
                              <Bell className="h-4 w-4 text-success" />
                            ) : (
                              <BellOff className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleRule(rule.id, !rule.is_active)}
                            title={rule.is_active ? 'Desativar' : 'Ativar'}
                          >
                            {rule.is_active ? (
                              <Power className="h-4 w-4 text-success" />
                            ) : (
                              <PowerOff className="h-4 w-4" />
                            )}
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(rule)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteRule(rule.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Help section */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-semibold mb-3">Como usar as regras de violação</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-muted-foreground">
            <div>
              <p className="font-medium text-foreground mb-1">🌐 Sites Bloqueados</p>
              <p>Adicione domínios que não podem ser acessados. Ex: facebook.com</p>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">📝 Palavras-chave</p>
              <p>Detecta quando certas palavras são digitadas. Ex: senha, confidencial</p>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">📱 Aplicativos</p>
              <p>Bloqueia o uso de aplicativos específicos. Ex: Discord, Steam</p>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">📄 Extensões de Arquivo</p>
              <p>Alerta sobre tipos de arquivo proibidos. Ex: .exe, .torrent</p>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">⏰ Horário de Trabalho</p>
              <p>Define o período permitido de trabalho. Ex: 08:00-18:00</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
