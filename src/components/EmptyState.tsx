import { memo, ReactNode } from 'react';
import { 
  FileQuestion, 
  Search, 
  Users, 
  AlertTriangle, 
  Inbox,
  FolderOpen,
  Database,
  FileX,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// ============================================================
// TYPES
// ============================================================

type EmptyStateVariant = 
  | 'default' 
  | 'search' 
  | 'users' 
  | 'error' 
  | 'inbox' 
  | 'folder' 
  | 'database'
  | 'file';

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

// ============================================================
// VARIANT CONFIGS
// ============================================================

const variantConfigs: Record<EmptyStateVariant, {
  icon: typeof FileQuestion;
  title: string;
  description: string;
}> = {
  default: {
    icon: Inbox,
    title: 'Nenhum item encontrado',
    description: 'Não há dados para exibir no momento.',
  },
  search: {
    icon: Search,
    title: 'Nenhum resultado encontrado',
    description: 'Tente ajustar os filtros ou termos de busca.',
  },
  users: {
    icon: Users,
    title: 'Nenhum usuário encontrado',
    description: 'Não há usuários cadastrados ou que correspondam aos filtros.',
  },
  error: {
    icon: AlertTriangle,
    title: 'Erro ao carregar dados',
    description: 'Ocorreu um problema ao carregar os dados. Tente novamente.',
  },
  inbox: {
    icon: Inbox,
    title: 'Caixa vazia',
    description: 'Você não tem itens pendentes.',
  },
  folder: {
    icon: FolderOpen,
    title: 'Pasta vazia',
    description: 'Esta pasta não contém arquivos.',
  },
  database: {
    icon: Database,
    title: 'Sem dados',
    description: 'O banco de dados está vazio.',
  },
  file: {
    icon: FileX,
    title: 'Arquivo não encontrado',
    description: 'O arquivo solicitado não existe ou foi removido.',
  },
};

const sizeClasses = {
  sm: {
    container: 'py-6',
    icon: 'h-8 w-8',
    iconContainer: 'h-12 w-12',
    title: 'text-base',
    description: 'text-sm',
  },
  md: {
    container: 'py-12',
    icon: 'h-10 w-10',
    iconContainer: 'h-16 w-16',
    title: 'text-lg',
    description: 'text-sm',
  },
  lg: {
    container: 'py-16',
    icon: 'h-12 w-12',
    iconContainer: 'h-20 w-20',
    title: 'text-xl',
    description: 'text-base',
  },
};

// ============================================================
// COMPONENT
// ============================================================

function EmptyStateComponent({
  variant = 'default',
  title,
  description,
  icon,
  action,
  className,
  size = 'md',
}: EmptyStateProps) {
  const config = variantConfigs[variant];
  const sizes = sizeClasses[size];
  const Icon = config.icon;

  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center',
      sizes.container,
      className
    )}>
      <div className={cn(
        'flex items-center justify-center rounded-full bg-muted mb-4',
        sizes.iconContainer
      )}>
        {icon || <Icon className={cn('text-muted-foreground', sizes.icon)} />}
      </div>
      
      <h3 className={cn('font-semibold text-foreground mb-1', sizes.title)}>
        {title || config.title}
      </h3>
      
      <p className={cn('text-muted-foreground max-w-sm mx-auto', sizes.description)}>
        {description || config.description}
      </p>

      {action && (
        <Button 
          onClick={action.onClick} 
          className="mt-4"
          variant="default"
        >
          {action.icon || <Plus className="mr-2 h-4 w-4" />}
          {action.label}
        </Button>
      )}
    </div>
  );
}

export const EmptyState = memo(EmptyStateComponent);

// ============================================================
// SPECIALIZED EMPTY STATES
// ============================================================

export const SearchEmptyState = memo(function SearchEmptyState({
  searchTerm,
  onClear,
}: {
  searchTerm?: string;
  onClear?: () => void;
}) {
  return (
    <EmptyState
      variant="search"
      title={searchTerm ? `Nenhum resultado para "${searchTerm}"` : 'Nenhum resultado'}
      description="Tente usar termos diferentes ou remover alguns filtros."
      action={onClear ? { label: 'Limpar busca', onClick: onClear } : undefined}
    />
  );
});

export const NoDataEmptyState = memo(function NoDataEmptyState({
  entityName,
  onAdd,
}: {
  entityName: string;
  onAdd?: () => void;
}) {
  return (
    <EmptyState
      variant="default"
      title={`Nenhum ${entityName} cadastrado`}
      description={`Comece adicionando seu primeiro ${entityName}.`}
      action={onAdd ? { label: `Adicionar ${entityName}`, onClick: onAdd } : undefined}
    />
  );
});

export const ErrorEmptyState = memo(function ErrorEmptyState({
  onRetry,
}: {
  onRetry?: () => void;
}) {
  return (
    <EmptyState
      variant="error"
      action={onRetry ? { label: 'Tentar novamente', onClick: onRetry } : undefined}
    />
  );
});
