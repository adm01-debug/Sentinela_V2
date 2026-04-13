import { PasswordResetRequest } from '@/hooks/usePasswordResetRequests';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Trash2, Clock, CheckCircle2, XCircle, Mail, User, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function getStatusBadge(status: string) {
  switch (status) {
    case 'pending':
      return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Pendente</Badge>;
    case 'approved':
      return <Badge variant="default" className="gap-1 bg-green-600"><CheckCircle2 className="h-3 w-3" />Aprovado</Badge>;
    case 'rejected':
      return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Rejeitado</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

interface ResetRequestCardProps {
  request: PasswordResetRequest;
  onApprove: (request: PasswordResetRequest) => void;
  onReject: (request: PasswordResetRequest) => void;
  onDelete: (id: string) => void;
}

export function ResetRequestCard({ request, onApprove, onReject, onDelete }: ResetRequestCardProps) {
  return (
    <Card className="hover:bg-muted/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium truncate">{request.user_email}</span>
              {getStatusBadge(request.status)}
            </div>
            
            {request.user_name && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <User className="h-3 w-3" />{request.user_name}
              </div>
            )}
            
            {request.reason && (
              <div className="flex items-start gap-2 text-sm text-muted-foreground mb-2">
                <MessageSquare className="h-3 w-3 mt-0.5" />
                <span className="line-clamp-2">{request.reason}</span>
              </div>
            )}
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Solicitado {formatDistanceToNow(new Date(request.requested_at), { addSuffix: true, locale: ptBR })}</span>
              {request.reviewed_at && (
                <span>Revisado {formatDistanceToNow(new Date(request.reviewed_at), { addSuffix: true, locale: ptBR })}</span>
              )}
            </div>
            
            {request.reviewer_notes && (
              <div className="mt-2 p-2 rounded bg-muted text-sm">
                <span className="font-medium">Notas: </span>{request.reviewer_notes}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {request.status === 'pending' && (
              <>
                <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700" onClick={() => onApprove(request)}>
                  <Check className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => onReject(request)}>
                  <X className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => onDelete(request.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
