import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Edit2, Trash2, CheckCircle, XCircle, Clock, Globe, Zap, Lock, Loader2, Shield } from 'lucide-react';
import { formatDistanceToNow, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { WhitelistedIP, CreateWhitelistData } from '@/hooks/useIPWhitelist';
import { IPWhitelistForm } from './IPWhitelistForm';

interface IPWhitelistTableProps {
  filteredIPs: WhitelistedIP[];
  editingIP: WhitelistedIP | null;
  formData: CreateWhitelistData;
  formErrors: Record<string, string>;
  isUpdatePending: boolean;
  onFormUpdate: (data: Partial<CreateWhitelistData>) => void;
  onToggleActive: (ip: WhitelistedIP) => void;
  onOpenEdit: (ip: WhitelistedIP) => void;
  onCloseEdit: () => void;
  onUpdate: () => void;
  onDelete: (id: string) => void;
}

function getStatusBadge(ip: WhitelistedIP) {
  if (!ip.is_active) return <Badge variant="secondary">Inativo</Badge>;
  if (ip.expires_at && isPast(new Date(ip.expires_at))) return <Badge variant="destructive">Expirado</Badge>;
  return <Badge className="bg-green-500">Ativo</Badge>;
}

export function IPWhitelistTable({
  filteredIPs, editingIP, formData, formErrors, isUpdatePending,
  onFormUpdate, onToggleActive, onOpenEdit, onCloseEdit, onUpdate, onDelete,
}: IPWhitelistTableProps) {
  return (
    <>
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
                <TableCell className="max-w-[200px] truncate">{ip.description || '-'}</TableCell>
                <TableCell>{getStatusBadge(ip)}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {ip.bypass_rate_limit && (
                      <Badge variant="outline" className="gap-1 text-xs"><Zap className="h-3 w-3" />Rate</Badge>
                    )}
                    {ip.bypass_auth && (
                      <Badge variant="outline" className="gap-1 text-xs text-amber-500"><Lock className="h-3 w-3" />Auth</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {ip.expires_at ? (
                    <div className="flex items-center gap-1 text-sm">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(ip.expires_at), { addSuffix: true, locale: ptBR })}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Nunca</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => onToggleActive(ip)} disabled={isUpdatePending}>
                      {ip.is_active ? <XCircle className="h-4 w-4 text-muted-foreground" /> : <CheckCircle className="h-4 w-4 text-green-500" />}
                    </Button>

                    <Dialog open={editingIP?.id === ip.id} onOpenChange={open => !open && onCloseEdit()}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => onOpenEdit(ip)}><Edit2 className="h-4 w-4" /></Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Editar IP</DialogTitle>
                          <DialogDescription>Atualize as configurações deste IP</DialogDescription>
                        </DialogHeader>
                        <IPWhitelistForm formData={formData} formErrors={formErrors} onUpdate={onFormUpdate} />
                        <DialogFooter>
                          <Button variant="outline" onClick={onCloseEdit}>Cancelar</Button>
                          <Button onClick={onUpdate} disabled={isUpdatePending}>
                            {isUpdatePending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Salvar
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remover IP</AlertDialogTitle>
                          <AlertDialogDescription>Tem certeza que deseja remover {ip.ip_address} da whitelist?</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDelete(ip.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Remover</AlertDialogAction>
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
    </>
  );
}
