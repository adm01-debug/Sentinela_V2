import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Shield,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Globe,
  Zap,
  Lock,
  Search,
  Loader2,
} from 'lucide-react';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  useWhitelistedIPs,
  useCreateWhitelistIP,
  useUpdateWhitelistIP,
  useDeleteWhitelistIP,
  WhitelistedIP,
  CreateWhitelistData,
} from '@/hooks/useIPWhitelist';

const IP_REGEX = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?:\/(?:3[0-2]|[12]?[0-9]))?$/;

export function IPWhitelistManager() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingIP, setEditingIP] = useState<WhitelistedIP | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<CreateWhitelistData>({
    ip_address: '',
    description: '',
    expires_at: null,
    bypass_rate_limit: true,
    bypass_auth: false,
    allowed_endpoints: [],
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const { data: whitelistedIPs = [], isLoading } = useWhitelistedIPs();
  const createIP = useCreateWhitelistIP();
  const updateIP = useUpdateWhitelistIP();
  const deleteIP = useDeleteWhitelistIP();

  const filteredIPs = whitelistedIPs.filter(ip =>
    ip.ip_address.includes(searchTerm) ||
    ip.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.ip_address) {
      errors.ip_address = 'IP é obrigatório';
    } else if (!IP_REGEX.test(formData.ip_address)) {
      errors.ip_address = 'IP inválido (formato: xxx.xxx.xxx.xxx ou CIDR)';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      ip_address: '',
      description: '',
      expires_at: null,
      bypass_rate_limit: true,
      bypass_auth: false,
      allowed_endpoints: [],
    });
    setFormErrors({});
  };

  const handleCreate = () => {
    if (!validateForm()) return;

    createIP.mutate(formData, {
      onSuccess: () => {
        setIsCreateOpen(false);
        resetForm();
      },
    });
  };

  const handleUpdate = () => {
    if (!editingIP || !validateForm()) return;

    updateIP.mutate(
      { id: editingIP.id, ...formData },
      {
        onSuccess: () => {
          setEditingIP(null);
          resetForm();
        },
      }
    );
  };

  const handleDelete = (id) => {
    deleteIP.mutate(id);
  };

  const handleToggleActive = (ip: WhitelistedIP) => {
    updateIP.mutate({ id: ip.id, is_active: !ip.is_active });
  };

  const openEditDialog = (ip: WhitelistedIP) => {
    setEditingIP(ip);
    setFormData({
      ip_address: ip.ip_address,
      description: ip.description || '',
      expires_at: ip.expires_at,
      bypass_rate_limit: ip.bypass_rate_limit,
      bypass_auth: ip.bypass_auth,
      allowed_endpoints: ip.allowed_endpoints || [],
    });
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return isPast(new Date(expiresAt));
  };

  const getStatusBadge = (ip: WhitelistedIP) => {
    if (!ip.is_active) {
      return <Badge variant="secondary">Inativo</Badge>;
    }
    if (isExpired(ip.expires_at)) {
      return <Badge variant="destructive">Expirado</Badge>;
    }
    return <Badge className="bg-green-500">Ativo</Badge>;
  };

  const activeCount = whitelistedIPs.filter(ip => ip.is_active && !isExpired(ip.expires_at)).length;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Whitelist de IP
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const FormContent = () => (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="ip_address">Endereço IP *</Label>
        <Input
          id="ip_address"
          value={formData.ip_address}
          onChange={e => setFormData({ ...formData, ip_address: e.target.value })}
          placeholder="192.168.1.1 ou 192.168.1.0/24"
          className={formErrors.ip_address ? 'border-destructive' : ''}
        />
        {formErrors.ip_address && (
          <p className="text-xs text-destructive">{formErrors.ip_address}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
          placeholder="Ex: Servidor de produção, Office principal"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="expires_at">Expira em (opcional)</Label>
        <Input
          id="expires_at"
          type="datetime-local"
          value={formData.expires_at ? formData.expires_at.slice(0, 16) : ''}
          onChange={e => setFormData({ 
            ...formData, 
            expires_at: e.target.value ? new Date(e.target.value).toISOString() : null 
          })}
        />
      </div>

      <div className="space-y-4 pt-4 border-t">
        <h4 className="font-medium text-sm">Permissões</h4>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Bypass Rate Limit</Label>
            <p className="text-xs text-muted-foreground">
              Ignora limites de requisições
            </p>
          </div>
          <Switch
            checked={formData.bypass_rate_limit}
            onCheckedChange={checked => setFormData({ ...formData, bypass_rate_limit: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Bypass Autenticação</Label>
            <p className="text-xs text-muted-foreground">
              ⚠️ Acesso sem autenticação (use com cuidado)
            </p>
          </div>
          <Switch
            checked={formData.bypass_auth}
            onCheckedChange={checked => setFormData({ ...formData, bypass_auth: checked })}
          />
        </div>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Whitelist de IP
            </CardTitle>
            <CardDescription>
              Gerencie IPs confiáveis que podem acessar o sistema
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              {activeCount} ativos
            </Badge>
            <Dialog open={isCreateOpen} onOpenChange={(open) => {
              setIsCreateOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Adicionar IP
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar IP à Whitelist</DialogTitle>
                  <DialogDescription>
                    IPs na whitelist terão acesso privilegiado ao sistema
                  </DialogDescription>
                </DialogHeader>
                <FormContent />
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreate} disabled={createIP.isPending}>
                    {createIP.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Adicionar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por IP ou descrição..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Table */}
        <ScrollArea className="h-[400px] rounded-md border">
          <Table>
            <TableHeader className="sticky top-0 bg-background">
              <TableRow>
                <TableHead>IP</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Permissões</TableHead>
                <TableHead>Expira</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIPs.map(ip => (
                <TableRow key={ip.id}>
                  <TableCell className="font-mono font-medium">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      {ip.ip_address}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {ip.description || '-'}
                  </TableCell>
                  <TableCell>{getStatusBadge(ip)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {ip.bypass_rate_limit && (
                        <Badge variant="outline" className="gap-1 text-xs">
                          <Zap className="h-3 w-3" />
                          Rate
                        </Badge>
                      )}
                      {ip.bypass_auth && (
                        <Badge variant="outline" className="gap-1 text-xs text-amber-500">
                          <Lock className="h-3 w-3" />
                          Auth
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {ip.expires_at ? (
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(ip.expires_at), { 
                          addSuffix: true, 
                          locale: ptBR 
                        })}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Nunca</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleActive(ip)}
                        disabled={updateIP.isPending}
                      >
                        {ip.is_active ? (
                          <XCircle className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </Button>

                      <Dialog
                        open={editingIP?.id === ip.id}
                        onOpenChange={open => !open && setEditingIP(null)}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(ip)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Editar IP</DialogTitle>
                            <DialogDescription>
                              Atualize as configurações deste IP
                            </DialogDescription>
                          </DialogHeader>
                          <FormContent />
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setEditingIP(null)}>
                              Cancelar
                            </Button>
                            <Button onClick={handleUpdate} disabled={updateIP.isPending}>
                              {updateIP.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : null}
                              Salvar
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remover IP</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja remover {ip.ip_address} da whitelist?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(ip.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Remover
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>

        {filteredIPs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Shield className="h-8 w-8 mb-2 opacity-50" />
            <p>Nenhum IP na whitelist</p>
          </div>
        )}

        {/* Info */}
        <div className="flex items-start gap-2 p-4 rounded-lg bg-muted/50 border text-sm">
          <Shield className="h-4 w-4 mt-0.5 text-primary" />
          <div>
            <p className="font-medium">Sobre a Whitelist</p>
            <p className="text-muted-foreground">
              IPs na whitelist podem ter acesso privilegiado, incluindo bypass de rate limiting.
              Use CIDR para intervalos (ex: 192.168.1.0/24).
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
