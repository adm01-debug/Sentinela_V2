import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Globe, 
  Shield, 
  ShieldOff, 
  ShieldCheck,
  Plus,
  Trash2,
  Search,
  Loader2,
  Clock,
  X,
  Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { useInternetAccess, type AccessLevel, type InternetAccessSetting } from '@/hooks/useInternetAccess';

const accessLevelConfig: Record<AccessLevel, { label: string; icon: typeof Globe; color: string; description: string }> = {
  restricted: { 
    label: 'Restrito', 
    icon: ShieldOff, 
    color: 'text-destructive bg-destructive/10 border-destructive/30',
    description: 'Apenas sites permitidos podem ser acessados'
  },
  partial: { 
    label: 'Parcial', 
    icon: Shield, 
    color: 'text-warning bg-warning/10 border-warning/30',
    description: 'Alguns sites são bloqueados'
  },
  full: { 
    label: 'Total', 
    icon: ShieldCheck, 
    color: 'text-success bg-success/10 border-success/30',
    description: 'Acesso completo à internet'
  },
};

export default function InternetAccess() {
  const navigate = useNavigate();
  const { settings, loading, updateSetting, deleteSetting, refetch } = useInternetAccess();
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<InternetAccessSetting | null>(null);
  
  const [formData, setFormData] = useState({
    employee_name: '',
    access_level: 'full' as AccessLevel,
    allowed_sites: [] as string[],
    blocked_sites: [] as string[],
    bandwidth_limit_mbps: '',
    active_hours_start: '',
    active_hours_end: '',
    notes: ''
  });

  const [newAllowedSite, setNewAllowedSite] = useState('');
  const [newBlockedSite, setNewBlockedSite] = useState('');

  const resetForm = () => {
    setFormData({
      employee_name: '',
      access_level: 'full',
      allowed_sites: [],
      blocked_sites: [],
      bandwidth_limit_mbps: '',
      active_hours_start: '',
      active_hours_end: '',
      notes: ''
    });
    setEditingSetting(null);
    setNewAllowedSite('');
    setNewBlockedSite('');
  };

  const openEditDialog = (setting: InternetAccessSetting) => {
    setEditingSetting(setting);
    setFormData({
      employee_name: setting.employee_name,
      access_level: setting.access_level,
      allowed_sites: setting.allowed_sites || [],
      blocked_sites: setting.blocked_sites || [],
      bandwidth_limit_mbps: setting.bandwidth_limit_mbps?.toString() || '',
      active_hours_start: setting.active_hours_start || '',
      active_hours_end: setting.active_hours_end || '',
      notes: setting.notes || ''
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.employee_name.trim()) return;

    const success = await updateSetting(formData.employee_name, {
      access_level: formData.access_level,
      allowed_sites: formData.allowed_sites,
      blocked_sites: formData.blocked_sites,
      bandwidth_limit_mbps: formData.bandwidth_limit_mbps ? parseInt(formData.bandwidth_limit_mbps) : null,
      active_hours_start: formData.active_hours_start || null,
      active_hours_end: formData.active_hours_end || null,
      notes: formData.notes || null
    });

    if (success) {
      setDialogOpen(false);
      resetForm();
    }
  };

  const addSiteToList = (type: 'allowed' | 'blocked') => {
    const site = type === 'allowed' ? newAllowedSite : newBlockedSite;
    if (!site.trim()) return;

    if (type === 'allowed') {
      setFormData(prev => ({ ...prev, allowed_sites: [...prev.allowed_sites, site.trim()] }));
      setNewAllowedSite('');
    } else {
      setFormData(prev => ({ ...prev, blocked_sites: [...prev.blocked_sites, site.trim()] }));
      setNewBlockedSite('');
    }
  };

  const removeSiteFromList = (type: 'allowed' | 'blocked', site: string) => {
    if (type === 'allowed') {
      setFormData(prev => ({ ...prev, allowed_sites: prev.allowed_sites.filter(s => s !== site) }));
    } else {
      setFormData(prev => ({ ...prev, blocked_sites: prev.blocked_sites.filter(s => s !== site) }));
    }
  };

  const filteredSettings = settings.filter(s => 
    s.employee_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get counts by access level
  const countByLevel = {
    restricted: settings.filter(s => s.access_level === 'restricted').length,
    partial: settings.filter(s => s.access_level === 'partial').length,
    full: settings.filter(s => s.access_level === 'full').length,
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
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center gap-4 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/settings')} className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Controle de Acesso à Internet</h1>
            <p className="text-sm text-muted-foreground">Gerencie o nível de acesso de cada funcionário</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Configurar Acesso
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingSetting ? 'Editar Acesso' : 'Configurar Acesso à Internet'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nome do Funcionário</Label>
                  <Input
                    placeholder="Ex: João Silva"
                    value={formData.employee_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, employee_name: e.target.value }))}
                    disabled={!!editingSetting}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Nível de Acesso</Label>
                  <Select
                    value={formData.access_level}
                    onValueChange={(v) => setFormData(prev => ({ ...prev, access_level: v as AccessLevel }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(accessLevelConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <config.icon className="h-4 w-4" />
                            {config.label} - {config.description}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.access_level === 'restricted' && (
                  <div className="space-y-2">
                    <Label>Sites Permitidos</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ex: google.com"
                        value={newAllowedSite}
                        onChange={(e) => setNewAllowedSite(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSiteToList('allowed'))}
                      />
                      <Button type="button" onClick={() => addSiteToList('allowed')}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.allowed_sites.map(site => (
                        <Badge key={site} variant="secondary" className="gap-1">
                          {site}
                          <X className="h-3 w-3 cursor-pointer" onClick={() => removeSiteFromList('allowed', site)} />
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {formData.access_level === 'partial' && (
                  <div className="space-y-2">
                    <Label>Sites Bloqueados</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ex: facebook.com"
                        value={newBlockedSite}
                        onChange={(e) => setNewBlockedSite(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSiteToList('blocked'))}
                      />
                      <Button type="button" onClick={() => addSiteToList('blocked')}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.blocked_sites.map(site => (
                        <Badge key={site} variant="destructive" className="gap-1">
                          {site}
                          <X className="h-3 w-3 cursor-pointer" onClick={() => removeSiteFromList('blocked', site)} />
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Horário Início
                    </Label>
                    <Input
                      type="time"
                      value={formData.active_hours_start}
                      onChange={(e) => setFormData(prev => ({ ...prev, active_hours_start: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Horário Fim
                    </Label>
                    <Input
                      type="time"
                      value={formData.active_hours_end}
                      onChange={(e) => setFormData(prev => ({ ...prev, active_hours_end: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Limite de Bandwidth (Mbps)</Label>
                  <Input
                    type="number"
                    placeholder="Ex: 100"
                    value={formData.bandwidth_limit_mbps}
                    onChange={(e) => setFormData(prev => ({ ...prev, bandwidth_limit_mbps: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Observações</Label>
                  <Textarea
                    placeholder="Notas adicionais..."
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmit} disabled={!formData.employee_name.trim()} className="gap-2">
                  <Save className="h-4 w-4" />
                  Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="container px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(accessLevelConfig).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <div key={key} className={`rounded-xl border p-4 ${config.color}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{config.label}</span>
                </div>
                <p className="text-2xl font-bold">{countByLevel[key as AccessLevel]}</p>
                <p className="text-xs opacity-80">{config.description}</p>
              </div>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar funcionário..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Settings List */}
        <div className="rounded-xl border border-border bg-card">
          {filteredSettings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Globe className="h-12 w-12 mb-4 opacity-50" />
              <p>Nenhuma configuração encontrada</p>
              <Button variant="link" className="mt-2" onClick={() => setDialogOpen(true)}>
                Configurar primeiro funcionário
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredSettings.map(setting => {
                const config = accessLevelConfig[setting.access_level];
                const Icon = config.icon;
                return (
                  <div 
                    key={setting.id} 
                    className="p-4 flex items-center gap-4 hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => openEditDialog(setting)}
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${config.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{setting.employee_name}</span>
                        <Badge variant="outline" className={config.color}>
                          {config.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        {setting.active_hours_start && setting.active_hours_end && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {setting.active_hours_start} - {setting.active_hours_end}
                          </span>
                        )}
                        {setting.access_level === 'restricted' && setting.allowed_sites?.length > 0 && (
                          <span>{setting.allowed_sites.length} sites permitidos</span>
                        )}
                        {setting.access_level === 'partial' && setting.blocked_sites?.length > 0 && (
                          <span>{setting.blocked_sites.length} sites bloqueados</span>
                        )}
                        {setting.bandwidth_limit_mbps && (
                          <span>Limite: {setting.bandwidth_limit_mbps} Mbps</span>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => { e.stopPropagation(); deleteSetting(setting.employee_name); }}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
