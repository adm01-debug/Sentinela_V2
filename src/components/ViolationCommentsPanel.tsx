import { memo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MessageSquare,
  Send,
  MoreHorizontal,
  Pencil,
  Trash2,
  Loader2,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Search,
  XCircle,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';
import {
  useViolationComments,
  useViolationActions,
  useAddComment,
  useEditComment,
  useDeleteComment,
  useRecordAction,
  actionConfig,
  statusConfig,
} from '@/hooks/useViolationComments';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ViolationCommentsPanelProps {
  violationId: string;
  currentStatus?: string;
}

export function ViolationCommentsPanel({ violationId, currentStatus = 'open' }: ViolationCommentsPanelProps) {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const { data: comments, isLoading: loadingComments } = useViolationComments(violationId);
  const { data: actions, isLoading: loadingActions } = useViolationActions(violationId);

  const addComment = useAddComment();
  const editComment = useEditComment();
  const deleteComment = useDeleteComment();
  const recordAction = useRecordAction();

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    addComment.mutate(
      { violationId, content: newComment },
      { onSuccess: () => setNewComment('') }
    );
  };

  const handleEditComment = (commentId: string) => {
    if (!editContent.trim()) return;
    editComment.mutate(
      { commentId, violationId, content: editContent },
      { onSuccess: () => { setEditingId(null); setEditContent(''); } }
    );
  };

  const handleAction = (actionType: keyof typeof actionConfig, notes?: string) => {
    recordAction.mutate({ violationId, actionType, notes });
  };

  const status = statusConfig[currentStatus] || statusConfig.open;

  return (
    <div className="space-y-4">
      {/* Status e Ações Rápidas */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Status:</span>
          <Badge className={status.color}>{status.label}</Badge>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Ações
              <MoreHorizontal className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {currentStatus === 'open' && (
              <DropdownMenuItem onClick={() => handleAction('acknowledge')}>
                <Eye className="h-4 w-4 mr-2" />
                Reconhecer
              </DropdownMenuItem>
            )}
            {['open', 'acknowledged'].includes(currentStatus) && (
              <DropdownMenuItem onClick={() => handleAction('investigate')}>
                <Search className="h-4 w-4 mr-2" />
                Investigar
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => handleAction('escalate')}>
              <AlertTriangle className="h-4 w-4 mr-2" />
              Escalar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {!['resolved', 'dismissed'].includes(currentStatus) && (
              <>
                <DropdownMenuItem onClick={() => handleAction('resolve')}>
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  Resolver
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAction('dismiss')}>
                  <XCircle className="h-4 w-4 mr-2 text-gray-500" />
                  Dispensar
                </DropdownMenuItem>
              </>
            )}
            {['resolved', 'dismissed'].includes(currentStatus) && (
              <DropdownMenuItem onClick={() => handleAction('reopen')}>
                <RotateCcw className="h-4 w-4 mr-2 text-red-500" />
                Reabrir
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Separator />

      {/* Histórico de Ações */}
      {actions && actions.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Histórico de Ações</h4>
          <div className="space-y-1">
            {actions.slice(0, 5).map((action) => {
              const config = actionConfig[action.action_type as keyof typeof actionConfig];
              return (
                <div key={action.id} className="flex items-center gap-2 text-sm">
                  <span>{config?.icon || '📌'}</span>
                  <span className="font-medium">{action.user?.full_name || action.user?.email}</span>
                  <span className="text-muted-foreground">{config?.label || action.action_type}</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {formatDistanceToNow(new Date(action.created_at), { addSuffix: true, locale: ptBR })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Separator />

      {/* Comentários */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Comentários ({comments?.length || 0})
        </h4>

        {loadingComments ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : (
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {comments?.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {(comment.user?.full_name || comment.user?.email || '?').substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {comment.user?.full_name || comment.user?.email}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: ptBR })}
                    </span>
                    {comment.is_edited && (
                      <span className="text-xs text-muted-foreground">(editado)</span>
                    )}
                    {comment.is_internal && (
                      <Badge variant="outline" className="text-xs">Interno</Badge>
                    )}
                  </div>
                  
                  {editingId === comment.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="min-h-[60px]"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleEditComment(comment.id)}>
                          Salvar
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm">{comment.content}</p>
                  )}
                </div>
                
                {comment.user_id === user?.id && editingId !== comment.id && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {
                        setEditingId(comment.id);
                        setEditContent(comment.content);
                      }}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => deleteComment.mutate({ commentId: comment.id, violationId })}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            ))}
            
            {(!comments || comments.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum comentário ainda
              </p>
            )}
          </div>
        )}

        {/* Adicionar comentário */}
        <div className="flex gap-2">
          <Textarea
            placeholder="Adicionar comentário..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[60px]"
          />
          <Button
            onClick={handleAddComment}
            disabled={!newComment.trim() || addComment.isPending}
            className="self-end"
          >
            {addComment.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
