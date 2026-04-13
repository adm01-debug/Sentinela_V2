import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Shield, Plus, CheckCircle, Search, Loader2 } from 'lucide-react';
import { isPast } from 'date-fns';
import {
  useWhitelistedIPs, useCreateWhitelistIP, useUpdateWhitelistIP, useDeleteWhitelistIP,
  WhitelistedIP, CreateWhitelistData,
} from '@/hooks/useIPWhitelist';
import { IPWhitelistForm } from './ip-whitelist/IPWhitelistForm';
import { IPWhitelistTable } from './ip-whitelist/IPWhitelistTable';

const IP_REGEX = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?:\/(?:3[0-2]|[12]?[0-9]))?$/;

const defaultFormData: CreateWhitelistData = {
  ip_address: '', description: '', expires_at: null, bypass_rate_limit: true, bypass_auth: false, allowed_endpoints: [],
};

export function IPWhitelistManager() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingIP, setEditingIP] = useState<WhitelistedIP | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<CreateWhitelistData>(defaultFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const { data: whitelistedIPs = [], isLoading } = useWhitelistedIPs();
  const createIP = useCreateWhitelistIP();
  const updateIP = useUpdateWhitelistIP();
  const deleteIP = useDeleteWhitelistIP();

  const filteredIPs = whitelistedIPs.filter(ip =>
    ip.ip_address.includes(searchTerm) || ip.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.ip_address) errors.ip_address = 'IP é obrigatório';
    else if (!IP_REGEX.test(formData.ip_address)) errors.ip_address = 'IP inválido (formato: xxx.xxx.xxx.xxx ou CIDR)';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => { setFormData(defaultFormData); setFormErrors({}); };
  const handleFormUpdate = (data: Partial<CreateWhitelistData>) => setFormData(prev => ({ ...prev, ...data }));

  const handleCreate = () => {
    if (!validateForm()) return;
    createIP.mutate(formData, { onSuccess: () => { setIsCreateOpen(false); resetForm(); } });
  };

  const handleUpdate = () => {
    if (!editingIP || !validateForm()) return;
    updateIP.mutate({ id: editingIP.id, ...formData }, { onSuccess: () => { setEditingIP(null); resetForm(); } });
  };

  const openEditDialog = (ip: WhitelistedIP) => {
    setEditingIP(ip);
    setFormData({ ip_address: ip.ip_address, description: ip.description || '', expires_at: ip.expires_at, bypass_rate_limit: ip.bypass_rate_limit, bypass_auth: ip.bypass_auth, allowed_endpoints: ip.allowed_endpoints || [] });
  };

  const activeCount = whitelistedIPs.filter(ip => ip.is_active && !(ip.expires_at && isPast(new Date(ip.expires_at)))).length;

  if (isLoading) {
    return (
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Whitelist de IP</CardTitle></CardHeader>
        <CardContent><div className="space-y-4"><Skeleton className="h-10 w-full" /><Skeleton className="h-64 w-full" /></div></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Whitelist de IP</CardTitle>
            <CardDescription>Gerencie IPs confiáveis que podem acessar o sistema</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1"><CheckCircle className="h-3 w-3 text-green-500" />{activeCount} ativos</Badge>
            <Dialog open={isCreateOpen} onOpenChange={(open) => { setIsCreateOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" />Adicionar IP</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar IP à Whitelist</DialogTitle>
                  <DialogDescription>IPs na whitelist terão acesso privilegiado ao sistema</DialogDescription>
                </DialogHeader>
                <IPWhitelistForm formData={formData} formErrors={formErrors} onUpdate={handleFormUpdate} />
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
                  <Button onClick={handleCreate} disabled={createIP.isPending}>
                    {createIP.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Adicionar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por IP ou descrição..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
        </div>

        <IPWhitelistTable
          filteredIPs={filteredIPs} editingIP={editingIP} formData={formData} formErrors={formErrors}
          isUpdatePending={updateIP.isPending} onFormUpdate={handleFormUpdate}
          onToggleActive={(ip) => updateIP.mutate({ id: ip.id, is_active: !ip.is_active })}
          onOpenEdit={openEditDialog} onCloseEdit={() => setEditingIP(null)}
          onUpdate={handleUpdate} onDelete={(id) => deleteIP.mutate(id)}
        />

        <div className="flex items-start gap-2 p-4 rounded-lg bg-muted/50 border text-sm">
          <Shield className="h-4 w-4 mt-0.5 text-primary" />
          <div>
            <p className="font-medium">Sobre a Whitelist</p>
            <p className="text-muted-foreground">IPs na whitelist podem ter acesso privilegiado, incluindo bypass de rate limiting. Use CIDR para intervalos (ex: 192.168.1.0/24).</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
