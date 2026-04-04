import React from 'react';
import {
  FileQuestion,
  Search,
  Users,
  FolderOpen,
  Activity,
  Shield,
  BarChart3,
  Settings,
  Plus,
  Upload,
  RefreshCw,
  AlertCircle,
  WifiOff,
  Lock,
  Clock,
  Database,
  Filter,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// Types
export type EmptyStateType =
  | 'no-data'
  | 'no-results'
  | 'no-users'
  | 'no-files'
  | 'no-activity'
  | 'no-violations'
  | 'no-reports'
  | 'no-settings'
  | 'error'
  | 'offline'
  | 'no-permission'
  | 'coming-soon'
  | 'no-database'
  | 'no-filters'
  | 'no-schedule'
  | 'custom';

interface EmptyStateConfig {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
}

const emptyStateConfigs: Record<Exclude<EmptyStateType, 'custom'>, EmptyStateConfig> = {
  'no-data': {
    icon: Database,
    title: 'Nenhum dado encontrado',
    description: 'Não há dados para exibir no momento.',
    color: 'text-muted-foreground',
  },
  'no-results': {
    icon: Search,
    title: 'Nenhum resultado',
    description: 'Nenhum resultado corresponde aos seus critérios de busca.',
    color: 'text-muted-foreground',
  },
  'no-users': {
    icon: Users,
    title: 'Nenhum usuário',
    description: 'Não há usuários cadastrados ainda.',
    color: 'text-primary',
  },
  'no-files': {
    icon: FolderOpen,
    title: 'Nenhum arquivo',
    description: 'Nenhum arquivo foi carregado ainda.',
    color: 'text-warning',
  },
  'no-activity': {
    icon: Activity,
    title: 'Sem atividade',
    description: 'Nenhuma atividade registrada neste período.',
    color: 'text-success',
  },
  'no-violations': {
    icon: Shield,
    title: 'Nenhuma violação',
    description: 'Ótimo! Não há violações de segurança.',
    color: 'text-success',
  },
  'no-reports': {
    icon: BarChart3,
    title: 'Nenhum relatório',
    description: 'Não há relatórios disponíveis.',
    color: 'text-primary',
  },
  'no-settings': {
    icon: Settings,
    title: 'Sem configurações',
    description: 'As configurações não foram definidas ainda.',
    color: 'text-muted-foreground',
  },
  'error': {
    icon: AlertCircle,
    title: 'Algo deu errado',
    description: 'Ocorreu um erro ao carregar os dados.',
    color: 'text-destructive',
  },
  'offline': {
    icon: WifiOff,
    title: 'Sem conexão',
    description: 'Você está offline. Verifique sua conexão.',
    color: 'text-warning',
  },
  'no-permission': {
    icon: Lock,
    title: 'Acesso restrito',
    description: 'Você não tem permissão para acessar este recurso.',
    color: 'text-destructive',
  },
  'coming-soon': {
    icon: Clock,
    title: 'Em breve',
    description: 'Este recurso estará disponível em breve.',
    color: 'text-primary',
  },
  'no-database': {
    icon: Database,
    title: 'Banco de dados vazio',
    description: 'O banco de dados ainda não contém registros.',
    color: 'text-muted-foreground',
  },
  'no-filters': {
    icon: Filter,
    title: 'Filtros muito restritivos',
    description: 'Tente ajustar os filtros para ver mais resultados.',
    color: 'text-warning',
  },
  'no-schedule': {
    icon: Calendar,
    title: 'Sem agendamentos',
    description: 'Nenhum agendamento configurado.',
    color: 'text-primary',
  },
};

// Action button config
interface EmptyStateAction {
  label: string;
  onClick: () => void;
  icon?: React.ElementType;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost';
}

// Props
interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  icon?: React.ElementType;
  iconColor?: string;
  primaryAction?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  illustration?: React.ReactNode;
}

// Sizes config
const sizeConfig = {
  sm: {
    icon: 'h-8 w-8',
    iconContainer: 'h-14 w-14',
    title: 'text-sm',
    description: 'text-xs',
    padding: 'py-6',
    gap: 'gap-2',
  },
  md: {
    icon: 'h-10 w-10',
    iconContainer: 'h-20 w-20',
    title: 'text-base',
    description: 'text-sm',
    padding: 'py-10',
    gap: 'gap-3',
  },
  lg: {
    icon: 'h-14 w-14',
    iconContainer: 'h-28 w-28',
    title: 'text-lg',
    description: 'text-base',
    padding: 'py-16',
    gap: 'gap-4',
  },
};

// Main component
export function EmptyState({
  type = 'no-data',
  title,
  description,
  icon,
  iconColor,
  primaryAction,
  secondaryAction,
  className,
  size = 'md',
  illustration,
}: EmptyStateProps) {
  const config = type !== 'custom' ? emptyStateConfigs[type] : null;
  const sizes = sizeConfig[size];

  const Icon = icon || config?.icon || FileQuestion;
  const displayTitle = title || config?.title || 'Vazio';
  const displayDescription = description || config?.description || '';
  const displayColor = iconColor || config?.color || 'text-muted-foreground';

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        sizes.padding,
        sizes.gap,
        className
      )}
    >
      {/* Illustration or Icon */}
      {illustration ? (
        <div className="mb-2">{illustration}</div>
      ) : (
        <div
          className={cn(
            'rounded-full bg-muted/50 flex items-center justify-center',
            sizes.iconContainer
          )}
        >
          <Icon className={cn(sizes.icon, displayColor)} />
        </div>
      )}

      {/* Text */}
      <div className="space-y-1 max-w-sm">
        <h3 className={cn('font-semibold', sizes.title)}>{displayTitle}</h3>
        {displayDescription && (
          <p className={cn('text-muted-foreground', sizes.description)}>
            {displayDescription}
          </p>
        )}
      </div>

      {/* Actions */}
      {(primaryAction || secondaryAction) && (
        <div className="flex items-center gap-2 mt-2">
          {primaryAction && (
            <Button
              variant={primaryAction.variant || 'default'}
              size={size === 'sm' ? 'sm' : 'default'}
              onClick={primaryAction.onClick}
            >
              {primaryAction.icon && (
                <primaryAction.icon className="h-4 w-4 mr-2" />
              )}
              {primaryAction.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant={secondaryAction.variant || 'outline'}
              size={size === 'sm' ? 'sm' : 'default'}
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.icon && (
                <secondaryAction.icon className="h-4 w-4 mr-2" />
              )}
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// Pre-configured empty states for common use cases
export function NoDataEmptyState(props: Omit<EmptyStateProps, 'type'>) {
  return <EmptyState type="no-data" {...props} />;
}

export function NoResultsEmptyState({
  searchTerm,
  onClearSearch,
  ...props
}: Omit<EmptyStateProps, 'type'> & {
  searchTerm?: string;
  onClearSearch?: () => void;
}) {
  return (
    <EmptyState
      type="no-results"
      description={
        searchTerm
          ? `Nenhum resultado para "${searchTerm}"`
          : 'Nenhum resultado corresponde aos seus critérios de busca.'
      }
      primaryAction={
        onClearSearch
          ? { label: 'Limpar busca', onClick: onClearSearch, icon: RefreshCw }
          : undefined
      }
      {...props}
    />
  );
}

export function ErrorEmptyState({
  onRetry,
  errorMessage,
  ...props
}: Omit<EmptyStateProps, 'type'> & {
  onRetry?: () => void;
  errorMessage?: string;
}) {
  return (
    <EmptyState
      type="error"
      description={errorMessage || 'Ocorreu um erro ao carregar os dados.'}
      primaryAction={
        onRetry
          ? { label: 'Tentar novamente', onClick: onRetry, icon: RefreshCw }
          : undefined
      }
      {...props}
    />
  );
}

export function NoPermissionEmptyState({
  onRequestAccess,
  ...props
}: Omit<EmptyStateProps, 'type'> & {
  onRequestAccess?: () => void;
}) {
  return (
    <EmptyState
      type="no-permission"
      primaryAction={
        onRequestAccess
          ? { label: 'Solicitar acesso', onClick: onRequestAccess }
          : undefined
      }
      {...props}
    />
  );
}

export function OfflineEmptyState({
  onRetry,
  ...props
}: Omit<EmptyStateProps, 'type'> & {
  onRetry?: () => void;
}) {
  return (
    <EmptyState
      type="offline"
      primaryAction={
        onRetry
          ? { label: 'Tentar novamente', onClick: onRetry, icon: RefreshCw }
          : undefined
      }
      {...props}
    />
  );
}

export function CreateFirstEmptyState({
  itemName,
  onCreate,
  onImport,
  ...props
}: Omit<EmptyStateProps, 'type'> & {
  itemName: string;
  onCreate?: () => void;
  onImport?: () => void;
}) {
  return (
    <EmptyState
      type="no-data"
      title={`Nenhum ${itemName}`}
      description={`Comece criando seu primeiro ${itemName}.`}
      primaryAction={
        onCreate
          ? { label: `Criar ${itemName}`, onClick: onCreate, icon: Plus }
          : undefined
      }
      secondaryAction={
        onImport
          ? { label: 'Importar', onClick: onImport, icon: Upload, variant: 'outline' }
          : undefined
      }
      {...props}
    />
  );
}

export function ComingSoonEmptyState(props: Omit<EmptyStateProps, 'type'>) {
  return <EmptyState type="coming-soon" {...props} />;
}

// Table-specific empty state
export function TableEmptyState({
  hasFilters = false,
  onClearFilters,
  onCreate,
  createLabel = 'Adicionar',
  ...props
}: Omit<EmptyStateProps, 'type'> & {
  hasFilters?: boolean;
  onClearFilters?: () => void;
  onCreate?: () => void;
  createLabel?: string;
}) {
  if (hasFilters) {
    return (
      <EmptyState
        type="no-filters"
        primaryAction={
          onClearFilters
            ? { label: 'Limpar filtros', onClick: onClearFilters, icon: Filter }
            : undefined
        }
        size="sm"
        {...props}
      />
    );
  }

  return (
    <EmptyState
      type="no-data"
      primaryAction={
        onCreate
          ? { label: createLabel, onClick: onCreate, icon: Plus }
          : undefined
      }
      size="sm"
      {...props}
    />
  );
}

export default EmptyState;
