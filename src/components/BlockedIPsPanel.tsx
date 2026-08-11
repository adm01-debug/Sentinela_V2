import { memo, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Ban, Plus, Unlock, Trash2, Clock, Shield, RefreshCw, Search } from "lucide-react";
import { useBlockedIPs, BlockIPInput } from "@/hooks/useBlockedIPs";
import { format, addHours, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

// IPv4 (com opção de CIDR /0-32) e IPv6 (simplificado, aceita formas comuns e CIDR /0-128)
const IPV4_REGEX = /^(25[0-5]|2[0-4]\d|[01]?\d\d?)(\.(25[0-5]|2[0-4]\d|[01]?\d\d?)){3}(\/([0-9]|[12]\d|3[0-2]))?$/;
const IPV6_REGEX = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|::([0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{0,4}|([0-9a-fA-F]{1,4}:){1,6}(:[0-9a-fA-F]{1,4}){1,1}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5})(\/(1[01][0-9]|12[0-8]|[0-9]{1,2}))?$/;

const isValidIP = (v: string) => {
  const t = v.trim();
  if (!t) return false;
  return IPV4_REGEX.test(t) || IPV6_REGEX.test(t);
};

interface BlockIPDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBlock: (input: BlockIPInput) => void;
  isBlocking: boolean;
  prefillIP?: string;
  prefillEndpoint?: string;
  prefillCount?: number;
  existingIPs: string[];
}

const BlockIPDialog = ({
  open,
  onOpenChange,
  onBlock,
  isBlocking,
  prefillIP = '',
  prefillEndpoint = '',
  prefillCount,
  existingIPs,
}: BlockIPDialogProps) => {
  const [ipAddress, setIpAddress] = useState(prefillIP);
  const [reason, setReason] = useState('');
  const [expiration, setExpiration] = useState<string>('permanent');
  const [touched, setTouched] = useState(false);

  // Sincroniza prefill sempre que dialog abre
  useEffect(() => {
    if (open) {
      setIpAddress(prefillIP);
      setReason('');
      setExpiration('permanent');
      setTouched(false);
    }
  }, [open, prefillIP]);

  const trimmed = ipAddress.trim();
  const isDuplicate = trimmed !== '' && existingIPs.includes(trimmed);
  const isValid = isValidIP(trimmed);
  const errorMsg = !trimmed
    ? null
    : !isValid
    ? 'Endereço IP inválido. Use IPv4 ou IPv6 (CIDR opcional).'
    : isDuplicate
    ? 'Este IP já está bloqueado ativamente.'
    : null;

  const canSubmit = isValid && !isDuplicate && !isBlocking;

  const handleSubmit = () => {
    setTouched(true);
    if (!canSubmit) return;

    let expiresAt: string | null = null;
    const now = new Date();
    switch (expiration) {
      case '1h': expiresAt = addHours(now, 1).toISOString(); break;
      case '24h': expiresAt = addHours(now, 24).toISOString(); break;
      case '7d': expiresAt = addDays(now, 7).toISOString(); break;
      case '30d': expiresAt = addDays(now, 30).toISOString(); break;
      default: expiresAt = null;
    }

    onBlock({
      ip_address: trimmed,
      reason: reason.trim() || undefined,
      expires_at: expiresAt,
      request_count_at_block: prefillCount,
      endpoint: prefillEndpoint || undefined,
    });

    onOpenChange(false);
  };

  const showError = touched && errorMsg;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ban className="h-5 w-5 text-destructive" aria-hidden="true" />
            Bloquear IP
          </DialogTitle>
          <DialogDescription>
            Adicione um IP à lista de bloqueio. Requisições deste IP serão rejeitadas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="block-ip">Endereço IP *</Label>
            <Input
              id="block-ip"
              placeholder="192.168.1.1 ou 2001:db8::1"
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
              onBlur={() => setTouched(true)}
              aria-invalid={!!showError}
              aria-describedby={showError ? "block-ip-error" : undefined}
              autoComplete="off"
            />
            {showError && (
              <p id="block-ip-error" role="alert" className="text-sm text-destructive">
                {errorMsg}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="block-reason">Motivo</Label>
            <Textarea
              id="block-reason"
              placeholder="Ex: Múltiplas tentativas de acesso não autorizado"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              maxLength={500}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="block-expiration">Duração do Bloqueio</Label>
            <Select value={expiration} onValueChange={setExpiration}>
              <SelectTrigger id="block-expiration">
                <SelectValue placeholder="Selecione a duração" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">1 hora</SelectItem>
                <SelectItem value="24h">24 horas</SelectItem>
                <SelectItem value="7d">7 dias</SelectItem>
                <SelectItem value="30d">30 dias</SelectItem>
                <SelectItem value="permanent">Permanente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            variant="destructive"
          >
            {isBlocking ? 'Bloqueando...' : 'Bloquear IP'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const BlockedIPsPanel = memo(() => {
  const {
    activeBlocks,
    inactiveBlocks,
    isLoading,
    blockIP,
    unblockIP,
    deleteBlock,
    isBlocking,
  } = useBlockedIPs();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [showAllHistory, setShowAllHistory] = useState(false);

  const activeIPs = useMemo(
    () => activeBlocks.map((b) => b.ip_address),
    [activeBlocks]
  );

  const q = search.trim().toLowerCase();
  const filteredActive = useMemo(() => {
    if (!q) return activeBlocks;
    return activeBlocks.filter(
      (b) =>
        b.ip_address.toLowerCase().includes(q) ||
        (b.reason ?? '').toLowerCase().includes(q) ||
        (b.endpoint ?? '').toLowerCase().includes(q)
    );
  }, [activeBlocks, q]);

  const filteredInactive = useMemo(() => {
    if (!q) return inactiveBlocks;
    return inactiveBlocks.filter(
      (b) =>
        b.ip_address.toLowerCase().includes(q) ||
        (b.reason ?? '').toLowerCase().includes(q)
    );
  }, [inactiveBlocks, q]);

  const historyLimit = showAllHistory ? filteredInactive.length : 10;

  const getExpirationStatus = (expiresAt: string | null) => {
    if (!expiresAt) return <Badge variant="destructive">Permanente</Badge>;
    const expDate = new Date(expiresAt);
    if (expDate < new Date()) return <Badge variant="secondary">Expirado</Badge>;
    return (
      <Badge variant="outline" className="gap-1">
        <Clock className="h-3 w-3" aria-hidden="true" />
        {format(expDate, "dd/MM HH:mm", { locale: ptBR })}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" aria-label="Carregando" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-destructive" aria-hidden="true" />
            <div>
              <CardTitle>IPs Bloqueados</CardTitle>
              <CardDescription>
                Gerencie IPs bloqueados manualmente. {activeBlocks.length} IP(s) atualmente bloqueado(s).
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                type="search"
                placeholder="Buscar IP, motivo ou endpoint..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 md:w-64"
                aria-label="Buscar IPs bloqueados"
              />
            </div>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
              Bloquear IP
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Active Blocks */}
        <div>
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Ban className="h-4 w-4 text-destructive" aria-hidden="true" />
            Bloqueios Ativos ({filteredActive.length}{q && ` de ${activeBlocks.length}`})
          </h3>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>IP</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Endpoint</TableHead>
                <TableHead>Bloqueado em</TableHead>
                <TableHead>Expira</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredActive.length > 0 ? (
                filteredActive.map((block) => (
                  <TableRow key={block.id}>
                    <TableCell className="font-mono font-medium">
                      {block.ip_address}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate" title={block.reason ?? undefined}>
                      {block.reason || <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell>
                      {block.endpoint ? (
                        <Badge variant="outline">{block.endpoint}</Badge>
                      ) : (
                        <Badge variant="secondary">Todos</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(block.blocked_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </TableCell>
                    <TableCell>{getExpirationStatus(block.expires_at)}</TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            aria-label={`Desbloquear IP ${block.ip_address}`}
                          >
                            <Unlock className="h-4 w-4 mr-1" aria-hidden="true" />
                            Desbloquear
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Desbloquear IP?</AlertDialogTitle>
                            <AlertDialogDescription>
                              O IP <span className="font-mono font-medium">{block.ip_address}</span> poderá fazer requisições novamente.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => unblockIP(block.id)}>
                              Desbloquear
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    {q ? 'Nenhum bloqueio ativo corresponde à busca' : 'Nenhum IP bloqueado atualmente'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Inactive Blocks / History */}
        {inactiveBlocks.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              Histórico de Bloqueios ({filteredInactive.length}{q && ` de ${inactiveBlocks.length}`})
            </h3>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>IP</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Bloqueado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInactive.length > 0 ? (
                  filteredInactive.slice(0, historyLimit).map((block) => (
                    <TableRow key={block.id} className="opacity-70">
                      <TableCell className="font-mono">
                        {block.ip_address}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate" title={block.reason ?? undefined}>
                        {block.reason || '-'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(block.blocked_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label={`Remover permanentemente o registro do IP ${block.ip_address}`}
                            >
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remover registro?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação removerá permanentemente o histórico de bloqueio do IP{' '}
                                <span className="font-mono font-medium">{block.ip_address}</span>. Não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteBlock(block.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Remover
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      Nenhum registro histórico corresponde à busca
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {filteredInactive.length > 10 && (
              <div className="mt-3 flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllHistory((v) => !v)}
                >
                  {showAllHistory ? 'Mostrar menos' : `Mostrar todos (${filteredInactive.length})`}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>

      <BlockIPDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onBlock={blockIP}
        isBlocking={isBlocking}
        existingIPs={activeIPs}
      />
    </Card>
  );
});

BlockedIPsPanel.displayName = "BlockedIPsPanel";
