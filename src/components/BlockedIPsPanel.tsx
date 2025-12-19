import { memo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Ban, Plus, Unlock, Trash2, Clock, Shield, RefreshCw } from "lucide-react";
import { useBlockedIPs, BlockIPInput } from "@/hooks/useBlockedIPs";
import { format, addHours, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface BlockIPDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBlock: (input: BlockIPInput) => void;
  isBlocking: boolean;
  prefillIP?: string;
  prefillEndpoint?: string;
  prefillCount?: number;
}

const BlockIPDialog = ({ 
  open, 
  onOpenChange, 
  onBlock, 
  isBlocking,
  prefillIP = '',
  prefillEndpoint = '',
  prefillCount
}: BlockIPDialogProps) => {
  const [ipAddress, setIpAddress] = useState(prefillIP);
  const [reason, setReason] = useState('');
  const [expiration, setExpiration] = useState<string>('permanent');

  const handleSubmit = () => {
    if (!ipAddress.trim()) return;

    let expiresAt: string | null = null;
    const now = new Date();
    
    switch (expiration) {
      case '1h':
        expiresAt = addHours(now, 1).toISOString();
        break;
      case '24h':
        expiresAt = addHours(now, 24).toISOString();
        break;
      case '7d':
        expiresAt = addDays(now, 7).toISOString();
        break;
      case '30d':
        expiresAt = addDays(now, 30).toISOString();
        break;
      default:
        expiresAt = null;
    }

    onBlock({
      ip_address: ipAddress,
      reason: reason || undefined,
      expires_at: expiresAt,
      request_count_at_block: prefillCount,
      endpoint: prefillEndpoint || undefined,
    });

    setIpAddress('');
    setReason('');
    setExpiration('permanent');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ban className="h-5 w-5 text-destructive" />
            Bloquear IP
          </DialogTitle>
          <DialogDescription>
            Adicione um IP à lista de bloqueio. Requisições deste IP serão rejeitadas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="ip">Endereço IP *</Label>
            <Input
              id="ip"
              placeholder="192.168.1.1"
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Motivo</Label>
            <Textarea
              id="reason"
              placeholder="Ex: Múltiplas tentativas de acesso não autorizado"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiration">Duração do Bloqueio</Label>
            <Select value={expiration} onValueChange={setExpiration}>
              <SelectTrigger>
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
            disabled={!ipAddress.trim() || isBlocking}
            variant="destructive"
          >
            {isBlocking ? 'Bloqueando...' : 'Bloquear IP'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const BlockedIPsPanel = () => {
  const { 
    activeBlocks, 
    inactiveBlocks, 
    isLoading, 
    blockIP, 
    unblockIP, 
    deleteBlock,
    isBlocking 
  } = useBlockedIPs();
  
  const [dialogOpen, setDialogOpen] = useState(false);

  const getExpirationStatus = (expiresAt: string | null) => {
    if (!expiresAt) return <Badge variant="destructive">Permanente</Badge>;
    
    const expDate = new Date(expiresAt);
    const now = new Date();
    
    if (expDate < now) {
      return <Badge variant="secondary">Expirado</Badge>;
    }
    
    return (
      <Badge variant="outline" className="gap-1">
        <Clock className="h-3 w-3" />
        {format(expDate, "dd/MM HH:mm", { locale: ptBR })}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-destructive" />
            <div>
              <CardTitle>IPs Bloqueados</CardTitle>
              <CardDescription>
                Gerencie IPs bloqueados manualmente. {activeBlocks.length} IP(s) atualmente bloqueado(s).
              </CardDescription>
            </div>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Bloquear IP
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Active Blocks */}
        <div>
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Ban className="h-4 w-4 text-destructive" />
            Bloqueios Ativos ({activeBlocks.length})
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
              {activeBlocks.length > 0 ? (
                activeBlocks.map((block) => (
                  <TableRow key={block.id}>
                    <TableCell className="font-mono font-medium">
                      {block.ip_address}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
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
                          <Button variant="ghost" size="sm">
                            <Unlock className="h-4 w-4 mr-1" />
                            Desbloquear
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Desbloquear IP?</AlertDialogTitle>
                            <AlertDialogDescription>
                              O IP {block.ip_address} poderá fazer requisições novamente.
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
                    Nenhum IP bloqueado atualmente
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
              <Clock className="h-4 w-4 text-muted-foreground" />
              Histórico de Bloqueios ({inactiveBlocks.length})
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
                {inactiveBlocks.slice(0, 10).map((block) => (
                  <TableRow key={block.id} className="opacity-60">
                    <TableCell className="font-mono">
                      {block.ip_address}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {block.reason || '-'}
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(block.blocked_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deleteBlock(block.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <BlockIPDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onBlock={blockIP}
        isBlocking={isBlocking}
      />
    </Card>
  );
};
