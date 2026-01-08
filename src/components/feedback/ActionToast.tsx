import { toast as sonnerToast, ExternalToast } from 'sonner';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Info, 
  Undo2, 
  ExternalLink,
  Trash2,
  Save,
  RefreshCcw,
  Copy,
  Eye,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================

interface ActionToastOptions extends ExternalToast {
  onUndo?: () => void | Promise<void>;
  onView?: () => void;
  onRetry?: () => void | Promise<void>;
  undoLabel?: string;
  viewLabel?: string;
  retryLabel?: string;
  duration?: number;
}

interface ConfirmToastOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  variant?: 'danger' | 'warning' | 'default';
}

// ============================================================
// STYLED TOAST WRAPPER
// ============================================================

const createActionButton = (
  label: string, 
  onClick: () => void, 
  icon?: React.ReactNode,
  variant: 'primary' | 'secondary' | 'danger' = 'primary'
) => {
  const variants = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  };
  
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
        variants[variant]
      )}
    >
      {icon}
      {label}
    </button>
  );
};

// ============================================================
// SUCCESS TOAST
// ============================================================

export function successToast(
  message: string, 
  options?: ActionToastOptions
) {
  const { onUndo, onView, undoLabel = 'Desfazer', viewLabel = 'Ver', ...rest } = options || {};
  
  return sonnerToast.success(message, {
    duration: 5000,
    icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
    action: onUndo || onView ? (
      <div className="flex gap-2">
        {onUndo && createActionButton(
          undoLabel,
          () => {
            sonnerToast.dismiss();
            onUndo();
          },
          <Undo2 className="h-3.5 w-3.5" />,
          'secondary'
        )}
        {onView && createActionButton(
          viewLabel,
          () => {
            sonnerToast.dismiss();
            onView();
          },
          <Eye className="h-3.5 w-3.5" />
        )}
      </div>
    ) : undefined,
    ...rest,
  });
}

// ============================================================
// ERROR TOAST
// ============================================================

export function errorToast(
  message: string, 
  options?: ActionToastOptions
) {
  const { onRetry, retryLabel = 'Tentar novamente', ...rest } = options || {};
  
  return sonnerToast.error(message, {
    duration: 8000,
    icon: <XCircle className="h-5 w-5 text-destructive" />,
    action: onRetry ? (
      createActionButton(
        retryLabel,
        () => {
          sonnerToast.dismiss();
          onRetry();
        },
        <RefreshCcw className="h-3.5 w-3.5" />,
        'danger'
      )
    ) : undefined,
    ...rest,
  });
}

// ============================================================
// WARNING TOAST
// ============================================================

export function warningToast(
  message: string, 
  options?: ActionToastOptions
) {
  const { onView, viewLabel = 'Ver detalhes', ...rest } = options || {};
  
  return sonnerToast.warning(message, {
    duration: 6000,
    icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
    action: onView ? (
      createActionButton(
        viewLabel,
        () => {
          sonnerToast.dismiss();
          onView();
        },
        <ExternalLink className="h-3.5 w-3.5" />,
        'secondary'
      )
    ) : undefined,
    ...rest,
  });
}

// ============================================================
// INFO TOAST
// ============================================================

export function infoToast(
  message: string, 
  options?: ActionToastOptions
) {
  const { onView, viewLabel = 'Saiba mais', ...rest } = options || {};
  
  return sonnerToast.info(message, {
    duration: 5000,
    icon: <Info className="h-5 w-5 text-blue-500" />,
    action: onView ? (
      createActionButton(
        viewLabel,
        () => {
          sonnerToast.dismiss();
          onView();
        },
        <ArrowRight className="h-3.5 w-3.5" />
      )
    ) : undefined,
    ...rest,
  });
}

// ============================================================
// DELETE TOAST (with undo)
// ============================================================

export function deleteToast(
  itemName: string,
  onUndo: () => void | Promise<void>,
  options?: Omit<ActionToastOptions, 'onUndo'>
) {
  return sonnerToast(
    <div className="flex items-center gap-3">
      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-destructive/10">
        <Trash2 className="h-4 w-4 text-destructive" />
      </div>
      <div>
        <p className="font-medium text-sm">{itemName} excluído</p>
        <p className="text-xs text-muted-foreground">Esta ação pode ser desfeita</p>
      </div>
    </div>,
    {
      duration: 8000,
      action: createActionButton(
        'Desfazer',
        () => {
          sonnerToast.dismiss();
          onUndo();
        },
        <Undo2 className="h-3.5 w-3.5" />,
        'secondary'
      ),
      ...options,
    }
  );
}

// ============================================================
// SAVE TOAST
// ============================================================

export function saveToast(
  message: string = 'Alterações salvas',
  options?: ActionToastOptions
) {
  const { onView, viewLabel = 'Ver', ...rest } = options || {};
  
  return sonnerToast.success(message, {
    duration: 4000,
    icon: <Save className="h-5 w-5 text-emerald-500" />,
    action: onView ? (
      createActionButton(
        viewLabel,
        () => {
          sonnerToast.dismiss();
          onView();
        },
        <Eye className="h-3.5 w-3.5" />
      )
    ) : undefined,
    ...rest,
  });
}

// ============================================================
// COPY TOAST
// ============================================================

export function copyToast(
  itemName: string = 'Conteúdo',
  options?: ExternalToast
) {
  return sonnerToast.success(`${itemName} copiado!`, {
    duration: 2500,
    icon: <Copy className="h-5 w-5 text-emerald-500" />,
    ...options,
  });
}

// ============================================================
// LOADING TOAST (returns dismiss function)
// ============================================================

export function loadingToast(
  message: string = 'Processando...',
  options?: ExternalToast
) {
  return sonnerToast.loading(message, {
    duration: Infinity,
    ...options,
  });
}

// ============================================================
// PROMISE TOAST
// ============================================================

interface PromiseToastMessages<T> {
  loading: string;
  success: string | ((data: T) => string);
  error: string | ((error: unknown) => string);
}

export function promiseToast<T>(
  promise: Promise<T>,
  messages: PromiseToastMessages<T>,
  options?: ExternalToast
) {
  return sonnerToast.promise(promise, {
    loading: messages.loading,
    success: messages.success,
    error: messages.error,
    ...options,
  });
}

// ============================================================
// CONFIRMATION TOAST
// ============================================================

export function confirmToast({
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  variant = 'default',
}: ConfirmToastOptions) {
  const icons = {
    danger: <XCircle className="h-5 w-5 text-destructive" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
    default: <Info className="h-5 w-5 text-blue-500" />,
  };

  const confirmVariants = {
    danger: 'danger' as const,
    warning: 'secondary' as const,
    default: 'primary' as const,
  };

  return sonnerToast(
    <div className="flex flex-col gap-2">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{icons[variant]}</div>
        <div>
          <p className="font-medium text-sm">{title}</p>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-2">
        {createActionButton(
          cancelLabel,
          () => {
            sonnerToast.dismiss();
            onCancel?.();
          },
          undefined,
          'secondary'
        )}
        {createActionButton(
          confirmLabel,
          async () => {
            sonnerToast.dismiss();
            await onConfirm();
          },
          undefined,
          confirmVariants[variant]
        )}
      </div>
    </div>,
    {
      duration: Infinity,
    }
  );
}

// ============================================================
// EXPORT UNIFIED API
// ============================================================

export const actionToast = {
  success: successToast,
  error: errorToast,
  warning: warningToast,
  info: infoToast,
  delete: deleteToast,
  save: saveToast,
  copy: copyToast,
  loading: loadingToast,
  promise: promiseToast,
  confirm: confirmToast,
  dismiss: sonnerToast.dismiss,
};
