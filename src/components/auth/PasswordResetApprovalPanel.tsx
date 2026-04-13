import React, { useState } from 'react';
import { usePasswordResetRequests, PasswordResetRequest } from '@/hooks/usePasswordResetRequests';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { KeyRound, Search, Clock, CheckCircle2, XCircle, Loader2, RefreshCw, Shield } from 'lucide-react';
import { ResetRequestCard } from './password-reset/ResetRequestCard';

export function PasswordResetApprovalPanel() {
  const {
    requests, pendingRequests, approvedRequests, rejectedRequests,
    isLoading, refetch, approveRequest, rejectRequest, deleteRequest,
    isApproving, isRejecting, isDeleting,
  } = usePasswordResetRequests();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedRequest, setSelectedRequest] = useState<PasswordResetRequest | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [notes, setNotes] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const getFilteredRequests = (list: PasswordResetRequest[]) => {
    if (!searchTerm) return list;
    const term = searchTerm.toLowerCase();
    return list.filter(r => r.user_email.toLowerCase().includes(term) || r.user_name?.toLowerCase().includes(term));
  };

  const handleAction = () => {
    if (!selectedRequest || !actionType) return;
    const onSuccess = () => { setSelectedRequest(null); setActionType(null); setNotes(''); };
    if (actionType === 'approve') approveRequest({ id: selectedRequest.id, notes }, { onSuccess });
    else rejectRequest({ id: selectedRequest.id, notes }, { onSuccess });
  };

  const renderRequestList = (list: PasswordResetRequest[]) => {
    const filtered = getFilteredRequests(list);
    if (filtered.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <KeyRound className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nenhuma solicitação encontrada</p>
        </div>
      );
    }
    return (
      <div className="space-y-3">
        {filtered.map((request) => (
          <ResetRequestCard key={request.id} request={request}
            onApprove={(r) => { setSelectedRequest(r); setActionType('approve'); }}
            onReject={(r) => { setSelectedRequest(r); setActionType('reject'); }}
            onDelete={(id) => setDeleteTarget(id)}
          />
        ))}
      </div>
    );
  };

  if (isLoading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/10"><Shield className="h-6 w-6 text-primary" /></div>
              <div><CardTitle>Aprovação de Reset de Senha</CardTitle><CardDescription>Gerencie solicitações de redefinição de senha</CardDescription></div>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}><RefreshCw className="h-4 w-4 mr-2" />Atualizar</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900">
              <CardContent className="p-4 text-center"><Clock className="h-6 w-6 mx-auto mb-2 text-yellow-600 dark:text-yellow-400" /><p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{pendingRequests.length}</p><p className="text-sm text-yellow-600 dark:text-yellow-400">Pendentes</p></CardContent>
            </Card>
            <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
              <CardContent className="p-4 text-center"><CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-green-600 dark:text-green-400" /><p className="text-2xl font-bold text-green-700 dark:text-green-300">{approvedRequests.length}</p><p className="text-sm text-green-600 dark:text-green-400">Aprovadas</p></CardContent>
            </Card>
            <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900">
              <CardContent className="p-4 text-center"><XCircle className="h-6 w-6 mx-auto mb-2 text-red-600 dark:text-red-400" /><p className="text-2xl font-bold text-red-700 dark:text-red-300">{rejectedRequests.length}</p><p className="text-sm text-red-600 dark:text-red-400">Rejeitadas</p></CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por email ou nome..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending" className="gap-2"><Clock className="h-4 w-4" />Pendentes{pendingRequests.length > 0 && <Badge variant="secondary">{pendingRequests.length}</Badge>}</TabsTrigger>
              <TabsTrigger value="approved" className="gap-2"><CheckCircle2 className="h-4 w-4" />Aprovadas</TabsTrigger>
              <TabsTrigger value="rejected" className="gap-2"><XCircle className="h-4 w-4" />Rejeitadas</TabsTrigger>
            </TabsList>
            <TabsContent value="pending" className="mt-4"><ScrollArea className="h-[400px]">{renderRequestList(pendingRequests)}</ScrollArea></TabsContent>
            <TabsContent value="approved" className="mt-4"><ScrollArea className="h-[400px]">{renderRequestList(approvedRequests)}</ScrollArea></TabsContent>
            <TabsContent value="rejected" className="mt-4"><ScrollArea className="h-[400px]">{renderRequestList(rejectedRequests)}</ScrollArea></TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={!!selectedRequest && !!actionType} onOpenChange={() => { setSelectedRequest(null); setActionType(null); setNotes(''); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{actionType === 'approve' ? 'Aprovar Solicitação' : 'Rejeitar Solicitação'}</DialogTitle>
            <DialogDescription>{actionType === 'approve' ? 'Um email com o link de redefinição será enviado ao usuário.' : 'O usuário não será notificado sobre a rejeição.'}</DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted"><p className="font-medium">{selectedRequest.user_email}</p>{selectedRequest.user_name && <p className="text-sm text-muted-foreground">{selectedRequest.user_name}</p>}</div>
              <div className="space-y-2"><label className="text-sm font-medium">Notas (opcional)</label><Textarea placeholder="Adicione observações..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} /></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setSelectedRequest(null); setActionType(null); setNotes(''); }}>Cancelar</Button>
            <Button variant={actionType === 'approve' ? 'default' : 'destructive'} onClick={handleAction} disabled={isApproving || isRejecting}>
              {(isApproving || isRejecting) && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{actionType === 'approve' ? 'Aprovar e Enviar Email' : 'Rejeitar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Remover Solicitação?</AlertDialogTitle><AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteTarget && deleteRequest(deleteTarget, { onSuccess: () => setDeleteTarget(null) })} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeleting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
