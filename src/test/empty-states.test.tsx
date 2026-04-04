import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  EmptyState,
  NoDataEmptyState,
  NoResultsEmptyState,
  ErrorEmptyState,
  NoPermissionEmptyState,
  OfflineEmptyState,
  CreateFirstEmptyState,
  ComingSoonEmptyState,
  TableEmptyState,
} from '@/components/EmptyStates';
import { Users } from 'lucide-react';

describe('EmptyState Component', () => {
  describe('Base EmptyState', () => {
    it('renders default no-data state', () => {
      render(<EmptyState />);
      expect(screen.getByText('Nenhum dado encontrado')).toBeInTheDocument();
    });

    it('renders with custom title and description', () => {
      render(<EmptyState title="Custom Title" description="Custom desc" />);
      expect(screen.getByText('Custom Title')).toBeInTheDocument();
      expect(screen.getByText('Custom desc')).toBeInTheDocument();
    });

    it('renders with custom icon', () => {
      const { container } = render(<EmptyState icon={Users} type="custom" title="Test" />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('renders primary action button', () => {
      const onClick = vi.fn();
      render(<EmptyState primaryAction={{ label: 'Create', onClick }} />);
      fireEvent.click(screen.getByText('Create'));
      expect(onClick).toHaveBeenCalledOnce();
    });

    it('renders secondary action button', () => {
      const onClick = vi.fn();
      render(<EmptyState secondaryAction={{ label: 'Import', onClick, variant: 'outline' }} />);
      fireEvent.click(screen.getByText('Import'));
      expect(onClick).toHaveBeenCalledOnce();
    });

    it('renders sm size correctly', () => {
      const { container } = render(<EmptyState size="sm" />);
      expect(container.querySelector('.py-6')).toBeInTheDocument();
    });

    it('renders md size correctly', () => {
      const { container } = render(<EmptyState size="md" />);
      expect(container.querySelector('.py-10')).toBeInTheDocument();
    });

    it('renders lg size with SVG illustration', () => {
      const { container } = render(<EmptyState size="lg" />);
      const svg = container.querySelector('svg[viewBox="0 0 200 140"]');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });

    it('renders custom illustration over default', () => {
      const illustration = <div data-testid="custom-ill">Custom</div>;
      render(<EmptyState illustration={illustration} size="lg" />);
      expect(screen.getByTestId('custom-ill')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(<EmptyState className="my-custom" />);
      expect(container.querySelector('.my-custom')).toBeInTheDocument();
    });
  });

  describe('All EmptyState types render without error', () => {
    const types = [
      'no-data', 'no-results', 'no-users', 'no-files', 'no-activity',
      'no-violations', 'no-reports', 'no-settings', 'error', 'offline',
      'no-permission', 'coming-soon', 'no-database', 'no-filters', 'no-schedule',
    ] as const;

    types.forEach((type) => {
      it(`renders "${type}" type`, () => {
        const { container } = render(<EmptyState type={type} />);
        expect(container.firstChild).toBeInTheDocument();
      });
    });
  });

  describe('Pre-configured variants', () => {
    it('NoDataEmptyState renders', () => {
      render(<NoDataEmptyState />);
      expect(screen.getByText('Nenhum dado encontrado')).toBeInTheDocument();
    });

    it('NoResultsEmptyState with search term', () => {
      render(<NoResultsEmptyState searchTerm="João" />);
      expect(screen.getByText('Nenhum resultado para "João"')).toBeInTheDocument();
    });

    it('NoResultsEmptyState with clear action', () => {
      const onClear = vi.fn();
      render(<NoResultsEmptyState onClearSearch={onClear} />);
      fireEvent.click(screen.getByText('Limpar busca'));
      expect(onClear).toHaveBeenCalledOnce();
    });

    it('ErrorEmptyState with retry', () => {
      const onRetry = vi.fn();
      render(<ErrorEmptyState onRetry={onRetry} />);
      expect(screen.getByText('Algo deu errado')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Tentar novamente'));
      expect(onRetry).toHaveBeenCalledOnce();
    });

    it('ErrorEmptyState with custom error message', () => {
      render(<ErrorEmptyState errorMessage="Falha de conexão" />);
      expect(screen.getByText('Falha de conexão')).toBeInTheDocument();
    });

    it('NoPermissionEmptyState with request access', () => {
      const onRequest = vi.fn();
      render(<NoPermissionEmptyState onRequestAccess={onRequest} />);
      expect(screen.getByText('Acesso restrito')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Solicitar acesso'));
      expect(onRequest).toHaveBeenCalledOnce();
    });

    it('OfflineEmptyState with retry', () => {
      const onRetry = vi.fn();
      render(<OfflineEmptyState onRetry={onRetry} />);
      expect(screen.getByText('Sem conexão')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Tentar novamente'));
      expect(onRetry).toHaveBeenCalledOnce();
    });

    it('CreateFirstEmptyState with create and import', () => {
      const onCreate = vi.fn();
      const onImport = vi.fn();
      render(<CreateFirstEmptyState itemName="relatório" onCreate={onCreate} onImport={onImport} />);
      expect(screen.getByText('Nenhum relatório')).toBeInTheDocument();
      expect(screen.getByText('Comece criando seu primeiro relatório.')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Criar relatório'));
      expect(onCreate).toHaveBeenCalledOnce();
      fireEvent.click(screen.getByText('Importar'));
      expect(onImport).toHaveBeenCalledOnce();
    });

    it('ComingSoonEmptyState renders', () => {
      render(<ComingSoonEmptyState />);
      expect(screen.getByText('Em breve')).toBeInTheDocument();
    });
  });

  describe('TableEmptyState', () => {
    it('renders no-data when no filters', () => {
      render(<TableEmptyState />);
      expect(screen.getByText('Nenhum dado encontrado')).toBeInTheDocument();
    });

    it('renders filter-specific message when hasFilters', () => {
      render(<TableEmptyState hasFilters />);
      expect(screen.getByText('Filtros muito restritivos')).toBeInTheDocument();
    });

    it('shows clear filters action', () => {
      const onClear = vi.fn();
      render(<TableEmptyState hasFilters onClearFilters={onClear} />);
      fireEvent.click(screen.getByText('Limpar filtros'));
      expect(onClear).toHaveBeenCalledOnce();
    });

    it('shows create action when no filters', () => {
      const onCreate = vi.fn();
      render(<TableEmptyState onCreate={onCreate} createLabel="Adicionar" />);
      fireEvent.click(screen.getByText('Adicionar'));
      expect(onCreate).toHaveBeenCalledOnce();
    });
  });
});
