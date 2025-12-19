import { memo, useCallback, useState, createContext, useContext, ReactNode } from 'react';
import { AlertTriangle, Trash2, Info, CheckCircle, XCircle } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================

type ConfirmVariant = 'danger' | 'warning' | 'info' | 'success';

interface ConfirmOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
}

interface ConfirmDialogContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  isOpen: boolean;
}

// ============================================================
// VARIANT CONFIGS
// ============================================================

const variantConfig: Record<ConfirmVariant, {
  icon: typeof AlertTriangle;
  iconClassName: string;
  confirmClassName: string;
}> = {
  danger: {
    icon: Trash2,
    iconClassName: 'text-destructive',
    confirmClassName: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  },
  warning: {
    icon: AlertTriangle,
    iconClassName: 'text-orange-500',
    confirmClassName: 'bg-orange-500 text-white hover:bg-orange-600',
  },
  info: {
    icon: Info,
    iconClassName: 'text-blue-500',
    confirmClassName: 'bg-blue-500 text-white hover:bg-blue-600',
  },
  success: {
    icon: CheckCircle,
    iconClassName: 'text-green-500',
    confirmClassName: 'bg-green-500 text-white hover:bg-green-600',
  },
};

// ============================================================
// CONTEXT
// ============================================================

const ConfirmDialogContext = createContext<ConfirmDialogContextType | undefined>(undefined);

export function useConfirmDialog() {
  const context = useContext(ConfirmDialogContext);
  if (!context) {
    throw new Error('useConfirmDialog must be used within ConfirmDialogProvider');
  }
  return context;
}

// ============================================================
// PROVIDER
// ============================================================

interface ConfirmDialogProviderProps {
  children: ReactNode;
}

export function ConfirmDialogProvider({ children }: ConfirmDialogProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    setOptions(opts);
    setIsOpen(true);
    
    return new Promise((resolve) => {
      setResolvePromise(() => resolve);
    });
  }, []);

  const handleConfirm = useCallback(async () => {
    if (options?.onConfirm) {
      setIsLoading(true);
      try {
        await options.onConfirm();
      } finally {
        setIsLoading(false);
      }
    }
    setIsOpen(false);
    resolvePromise?.(true);
  }, [options, resolvePromise]);

  const handleCancel = useCallback(() => {
    options?.onCancel?.();
    setIsOpen(false);
    resolvePromise?.(false);
  }, [options, resolvePromise]);

  const variant = options?.variant || 'danger';
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <ConfirmDialogContext.Provider value={{ confirm, isOpen }}>
      {children}
      
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className={cn('flex h-10 w-10 items-center justify-center rounded-full bg-muted')}>
                <Icon className={cn('h-5 w-5', config.iconClassName)} />
              </div>
              <AlertDialogTitle>{options?.title}</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="ml-13">
              {options?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel} disabled={isLoading}>
              {options?.cancelText || 'Cancelar'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={isLoading}
              className={config.confirmClassName}
            >
              {isLoading ? 'Aguarde...' : options?.confirmText || 'Confirmar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmDialogContext.Provider>
  );
}

// ============================================================
// STANDALONE COMPONENT
// ============================================================

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

function ConfirmDialogComponent({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmDialogProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  const handleConfirm = useCallback(async () => {
    await onConfirm();
    onOpenChange(false);
  }, [onConfirm, onOpenChange]);

  const handleCancel = useCallback(() => {
    onCancel?.();
    onOpenChange(false);
  }, [onCancel, onOpenChange]);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <Icon className={cn('h-5 w-5', config.iconClassName)} />
            </div>
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="ml-13">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={isLoading}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className={config.confirmClassName}
          >
            {isLoading ? 'Aguarde...' : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export const ConfirmDialog = memo(ConfirmDialogComponent);

// ============================================================
// DELETE CONFIRMATION SHORTCUT
// ============================================================

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName?: string;
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
}

export const DeleteConfirmDialog = memo(function DeleteConfirmDialog({
  open,
  onOpenChange,
  itemName = 'este item',
  onConfirm,
  isLoading,
}: DeleteConfirmDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Confirmar exclusão"
      description={`Tem certeza que deseja excluir ${itemName}? Esta ação não pode ser desfeita.`}
      confirmText="Excluir"
      variant="danger"
      onConfirm={onConfirm}
      isLoading={isLoading}
    />
  );
});
