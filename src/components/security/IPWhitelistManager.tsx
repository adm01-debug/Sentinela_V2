import { useMemo, useState } from 'react';
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
import { formatDistanceToNow, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  useWhitelistedIPs,
  useCreateWhitelistIP,
  useUpdateWhitelistIP,
  useDeleteWhitelistIP,
  WhitelistedIP,
  CreateWhitelistData,
} from '@/hooks/useIPWhitelist';

const IPV4_REGEX = /^(25[0-5]|2[0-4]\d|[01]?\d\d?)(\.(25[0-5]|2[0-4]\d|[01]?\d\d?)){3}(\/([0-9]|[12]\d|3[0-2]))?$/;
const IPV6_REGEX = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|::([0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{0,4}|([0-9a-fA-F]{1,4}:){1,6}(:[0-9a-fA-F]{1,4}){1,1}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5})(\/(1[01][0-9]|12[0-8]|[0-9]{1,2}))?$/;

const isValidIP = (v: string) => {
  const t = v.trim();
  return !!t && (IPV4_REGEX.test(t) || IPV6_REGEX.test(t));
};

// Converte ISO UTC -> string aceita pelo input datetime-local (hora local)
const isoToLocalInput = (iso: string | null | undefined): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const isExpired = (expiresAt: string | null) => !!expiresAt && isPast(new Date(expiresAt));

interface FormState extends CreateWhitelistData {
  ip_address: string;
  description: string;
  expires_at: string | null;
  bypass_rate_limit: boolean;
  bypass_auth: boolean;
  allowed_endpoints: string[];
}

const emptyForm = (): FormState => ({
  ip_address: '',
  description: '',
  expires_at: null,
  bypass_rate_limit: true,
  bypass_auth: false,
  allowed_endpoints: [],
});

interface WhitelistFormProps {
  value: FormState;
  onChange: (patch: Partial<FormState>) => void;
  errors: Record<string, string>;
}

// Componente estável (fora do pai) — evita remount e perda de foco a cada tecla.
function WhitelistForm({ value, onChange, errors }: WhitelistFormProps) {
  const expiresInvalid = value.expires_at && isPast(new Date(value.expires_at));

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="wl-ip">Endereço IP *</Label>
        <Input
          id="wl-ip"
          value={value.ip_address}
          onChange={(e) => onChange({ ip_address: e.target.value })}
          placeholder="192.168.1.0/24 ou 2001:db8::1"
          className={errors.ip_address ? 'border-destructive' : ''}
          aria-invalid={!!errors.ip_address}
          aria-describedby={errors.ip_address ? 'wl-ip-error' : undefined}
          autoComplete="off"
          spellCheck={false}
        />
        {errors.ip_address && (
          <p id="wl-ip-error" role="alert" className="text-xs text-destructive">
            {errors.ip_address}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="wl-description">Descrição</Label>
        <Textarea
          id="wl-description"
          value={value.description ?? ''}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Ex: Servidor de produção, Office principal"
          maxLength={500}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="wl-expires">Expira em (opcional)</Label>
        <Input
          id="wl-expires"
          type="datetime-local"
          value={isoToLocalInput(value.expires_at)}
          onChange={(e) =>
            onChange({
              expires_at: e.target.value ? new Date(e.target.value).toISOString() : null,
            })
          }
          aria-invalid={!!expiresInvalid}
          aria-describedby={expiresInvalid ? 'wl-expires-warn' : undefined}
        />
        {expiresInvalid && (
          <p id="wl-expires-warn" className="text-xs text-amber-600 dark:text-amber-500">
            Data no passado — o IP será considerado expirado.
          </p>
        )}
      </div>

      <div className="space-y-4 pt-4 border-t">
        <h4 className="font-medium text-sm">Permissões</h4>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="wl-bypass-rate">Bypass Rate Limit</Label>
            <p className="text-xs text-muted-foreground">Ignora limites de requisições</p>
          </div>
          <Switch
            id="wl-bypass-rate"
            checked={value.bypass_rate_limit}
            onCheckedChange={(checked) => onChange({ bypass_rate_limit: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="wl-bypass-auth">Bypass Autenticação</Label>
            <p className="text-xs text-muted-foreground">
              ⚠️ Acesso sem autenticação (use com cuidado)
            </p>
          </div>
          <Switch
            id="wl-bypass-auth"
            checked={value.bypass_auth}
            onCheckedChange={(checked) => onChange({ bypass_auth: checked })}
          />
        </div>
      </div>
    </div>
  );
}

export function IPWhitelistManager() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingIP, setEditingIP] = useState<WhitelistedIP | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<FormState>(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const { data: whitelistedIPs = [], isLoading } = useWhitelistedIPs();
  const createIP = useCreateWhitelistIP();
  const updateIP = useUpdateWhitelistIP();
  const deleteIP = useDeleteWhitelistIP();

  const q = searchTerm.trim().toLowerCase();
  const filteredIPs = useMemo(() => {
    if (!q) return whitelistedIPs;
    return whitelistedIPs.filter(
      (ip) =>
        ip.ip_address.toLowerCase().includes(q) ||
        (ip.description ?? '').toLowerCase().includes(q),
    );
  }, [whitelistedIPs, q]);

  const activeCount = useMemo(
    () => whitelistedIPs.filter((ip) => ip.is_active && !isExpired(ip.expires_at)).length,
    [whitelistedIPs],
  );

  const patchForm = (patch: Partial<FormState>) => {
    setFormData((prev) => ({ ...prev, ...patch }));
    // Limpa erro do campo alterado
    const key = Object.keys(patch)[0];
    if (key && formErrors[key]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.ip_address.trim()) {
      errors.ip_address = 'IP é obrigatório';
    } else if (!isValidIP(formData.ip_address)) {
      errors.ip_address = 'IP inválido. Use IPv4, IPv6 ou notação CIDR.';
    } else {
      // Duplicata (ignora o registro sendo editado)
      const duplicate = whitelistedIPs.some(
        (ip) =>
          ip.ip_address === formData.ip_address.trim() &&
          ip.id !== editingIP?.id,
      );
      if (duplicate) errors.ip_address = 'Este IP já está na whitelist.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setFormData(emptyForm());
    setFormErrors({});
  };

  const handleCreate = () => {
    if (!validateForm()) return;
    createIP.mutate(
      { ...formData, ip_address: formData.ip_address.trim() },
      {
        onSuccess: () => {
          setIsCreateOpen(false);
          resetForm();
        },
      },
    );
  };

  const handleUpdate = () => {
    if (!editingIP || !validateForm()) return;
    updateIP.mutate(
      { id: editingIP.id, ...formData, ip_address: formData.ip_address.trim() },
      {
        onSuccess: () => {
          setEditingIP(null);
          resetForm();
        },
      },
    );
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
    setFormErrors({});
  };

  const getStatusBadge = (ip: WhitelistedIP) => {
    if (!ip.is_active) return <Badge variant="secondary">Inativo</Badge>;
    if (isExpired(ip.expires_at)) return <Badge variant="destructive">Expirado</Badge>;
    return <Badge className="bg-success text-success-foreground hover:bg-success/90">Ativo</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" aria-hidden="true" />
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

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" aria-hidden="true" />
              Whitelist de IP
            </CardTitle>
            <CardDescription>
              Gerencie IPs confiáveis que podem acessar o sistema
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <CheckCircle className="h-3 w-3 text-success" aria-hidden="true" />
              {activeCount} ativos
            </Badge>
            <Dialog
              open={isCreateOpen}
              onOpenChange={(open) => {
                setIsCreateOpen(open);
                if (!open) resetForm();
              }}
            >
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" aria-hidden="true" />
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
                <WhitelistForm value={formData} onChange={patchForm} errors={formErrors} />
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreate} disabled={createIP.isPending}>
                    {createIP.isPending && (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" aria-hidden="true" />
                    )}
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
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder="Buscar por IP ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            aria-label="Buscar IPs da whitelist"
          />
        </div>

        {/* Table */}
        {filteredIPs.length > 0 ? (
          <ScrollArea className="h-[400px] rounded-md border">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
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
                {filteredIPs.map((ip) => (
                  <TableRow key={ip.id}>
                    <TableCell className="font-mono font-medium">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        {ip.ip_address}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate" title={ip.description ?? undefined}>
                      {ip.description || '-'}
                    </TableCell>
                    <TableCell>{getStatusBadge(ip)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {ip.bypass_rate_limit && (
                          <Badge variant="outline" className="gap-1 text-xs">
                            <Zap className="h-3 w-3" aria-hidden="true" />
                            Rate
                          </Badge>
                        )}
                        {ip.bypass_auth && (
                          <Badge variant="outline" className="gap-1 text-xs text-warning">
                            <Lock className="h-3 w-3" aria-hidden="true" />
                            Auth
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {ip.expires_at ? (
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="h-3 w-3" aria-hidden="true" />
                          {formatDistanceToNow(new Date(ip.expires_at), {
                            addSuffix: true,
                            locale: ptBR,
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
                          onClick={() =>
                            updateIP.mutate({ id: ip.id, is_active: !ip.is_active })
                          }
                          disabled={updateIP.isPending}
                          aria-label={ip.is_active ? `Desativar ${ip.ip_address}` : `Ativar ${ip.ip_address}`}
                        >
                          {ip.is_active ? (
                            <XCircle className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-success" aria-hidden="true" />
                          )}
                        </Button>

                        <Dialog
                          open={editingIP?.id === ip.id}
                          onOpenChange={(open) => {
                            if (!open) {
                              setEditingIP(null);
                              resetForm();
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(ip)}
                              aria-label={`Editar ${ip.ip_address}`}
                            >
                              <Edit2 className="h-4 w-4" aria-hidden="true" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Editar IP</DialogTitle>
                              <DialogDescription>
                                Atualize as configurações deste IP
                              </DialogDescription>
                            </DialogHeader>
                            <WhitelistForm value={formData} onChange={patchForm} errors={formErrors} />
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setEditingIP(null);
                                  resetForm();
                                }}
                              >
                                Cancelar
                              </Button>
                              <Button onClick={handleUpdate} disabled={updateIP.isPending}>
                                {updateIP.isPending && (
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" aria-hidden="true" />
                                )}
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
                              aria-label={`Remover ${ip.ip_address}`}
                            >
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remover IP</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja remover{' '}
                                <span className="font-mono font-medium">{ip.ip_address}</span>{' '}
                                da whitelist? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteIP.mutate(ip.id)}
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
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border rounded-md">
            <Shield className="h-8 w-8 mb-2 opacity-50" aria-hidden="true" />
            <p>{q ? 'Nenhum IP corresponde à busca' : 'Nenhum IP na whitelist'}</p>
          </div>
        )}

        {/* Info */}
        <div className="flex items-start gap-2 p-4 rounded-lg bg-muted/50 border text-sm">
          <Shield className="h-4 w-4 mt-0.5 text-primary" aria-hidden="true" />
          <div>
            <p className="font-medium">Sobre a Whitelist</p>
            <p className="text-muted-foreground">
              IPs na whitelist podem ter acesso privilegiado, incluindo bypass de rate limiting.
              Use CIDR para intervalos (ex: 192.168.1.0/24) ou IPv6 conforme necessário.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
