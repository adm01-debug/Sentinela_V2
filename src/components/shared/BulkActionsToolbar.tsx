// ============================================================
// BULK ACTIONS TOOLBAR COMPONENT
// Barra de ferramentas para ações em lote
// ============================================================

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Trash2,
  Archive,
  RotateCcw,
  Copy,
  MoreHorizontal,
  X,
  Loader2,
  Download,
  Tag,
  UserPlus,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================

interface BulkAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline';
  requireConfirm?: boolean;
  confirmTitle?: string;
  confirmDescription?: string;
}

interface BulkActionsToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onDelete?: () => void;
  onArchive?: () => void;
  onRestore?: () => void;
  onDuplicate?: () => void;
  onExport?: () => void;
  onAssign?: () => void;
  onTag?: () => void;
  customActions?: BulkAction[];
  isProcessing?: boolean;
  className?: string;
}

// ============================================================
// COMPONENT
// ============================================================

export function BulkActionsToolbar({
  selectedCount,
  onClearSelection,
  onDelete,
  onArchive,
  onRestore,
  onDuplicate,
  onExport,
  onAssign,
  onTag,
  customActions = [],
  isProcessing = false,
  className,
}: BulkActionsToolbarProps) {
  const [confirmAction, setConfirmAction] = useState<BulkAction | null>(null);

  if (selectedCount === 0) return null;

  // ============================================================
  // BUILT-IN ACTIONS
  // ============================================================

  const builtInActions: BulkAction[] = [
    ...(onDelete
      ? [
          {
            id: 'delete',
            label: 'Excluir',
            icon: <Trash2 className="h-4 w-4" />,
            variant: 'destructive' as const,
            requireConfirm: true,
            confirmTitle: 'Excluir itens selecionados?',
            confirmDescription: `Esta ação irá excluir ${selectedCount} item(s). Esta ação não pode ser desfeita.`,
          },
        ]
      : []),
    ...(onArchive
      ? [
          {
            id: 'archive',
            label: 'Arquivar',
            icon: <Archive className="h-4 w-4" />,
            requireConfirm: true,
            confirmTitle: 'Arquivar itens selecionados?',
            confirmDescription: `Esta ação irá arquivar ${selectedCount} item(s).`,
          },
        ]
      : []),
    ...(onRestore
      ? [
          {
            id: 'restore',
            label: 'Restaurar',
            icon: <RotateCcw className="h-4 w-4" />,
          },
        ]
      : []),
    ...(onDuplicate
      ? [
          {
            id: 'duplicate',
            label: 'Duplicar',
            icon: <Copy className="h-4 w-4" />,
          },
        ]
      : []),
    ...(onExport
      ? [
          {
            id: 'export',
            label: 'Exportar',
            icon: <Download className="h-4 w-4" />,
          },
        ]
      : []),
    ...(onAssign
      ? [
          {
            id: 'assign',
            label: 'Atribuir',
            icon: <UserPlus className="h-4 w-4" />,
          },
        ]
      : []),
    ...(onTag
      ? [
          {
            id: 'tag',
            label: 'Adicionar Tag',
            icon: <Tag className="h-4 w-4" />,
          },
        ]
      : []),
  ];

  const allActions = [...builtInActions, ...customActions];
  const primaryActions = allActions.slice(0, 3);
  const moreActions = allActions.slice(3);

  // ============================================================
  // HANDLERS
  // ============================================================

  const executeAction = (action: BulkAction) => {
    if (action.requireConfirm) {
      setConfirmAction(action);
      return;
    }

    triggerAction(action.id);
  };

  const triggerAction = (actionId: string) => {
    switch (actionId) {
      case 'delete':
        onDelete?.();
        break;
      case 'archive':
        onArchive?.();
        break;
      case 'restore':
        onRestore?.();
        break;
      case 'duplicate':
        onDuplicate?.();
        break;
      case 'export':
        onExport?.();
        break;
      case 'assign':
        onAssign?.();
        break;
      case 'tag':
        onTag?.();
        break;
      default:
        // Custom action
        const customAction = customActions.find((a) => a.id === actionId);
        if (customAction) {
          // Custom actions would need their own handlers
        }
    }

    setConfirmAction(null);
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <>
      <div
        className={cn(
          'flex items-center gap-2 p-2 bg-muted/50 rounded-lg border',
          'animate-in slide-in-from-top-2 duration-200',
          className
        )}
      >
        {/* Selection Count */}
        <div className="flex items-center gap-2 px-2">
          <span className="text-sm font-medium">
            {selectedCount} selecionado{selectedCount !== 1 ? 's' : ''}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onClearSelection}
            disabled={isProcessing}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="h-4 w-px bg-border" />

        {/* Primary Actions */}
        <div className="flex items-center gap-1">
          {primaryActions.map((action) => (
            <Button
              key={action.id}
              variant={action.variant ?? 'outline'}
              size="sm"
              onClick={() => executeAction(action)}
              disabled={isProcessing}
              className="gap-2"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                action.icon
              )}
              <span className="hidden sm:inline">{action.label}</span>
            </Button>
          ))}
        </div>

        {/* More Actions Dropdown */}
        {moreActions.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={isProcessing}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {moreActions.map((action, index) => (
                <div key={action.id}>
                  {index > 0 && action.variant === 'destructive' && (
                    <DropdownMenuSeparator />
                  )}
                  <DropdownMenuItem
                    onClick={() => executeAction(action)}
                    className={cn(
                      'gap-2',
                      action.variant === 'destructive' && 'text-destructive'
                    )}
                  >
                    {action.icon}
                    {action.label}
                  </DropdownMenuItem>
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Confirm Dialog */}
      <AlertDialog
        open={!!confirmAction}
        onOpenChange={(open) => !open && setConfirmAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.confirmTitle ?? 'Confirmar ação?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.confirmDescription ??
                'Tem certeza que deseja executar esta ação?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmAction && triggerAction(confirmAction.id)}
              className={cn(
                confirmAction?.variant === 'destructive' &&
                  'bg-destructive text-destructive-foreground hover:bg-destructive/90'
              )}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default BulkActionsToolbar;
