import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Header } from '../Header';

// Mock hooks
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { email: 'test@example.com', user_metadata: { name: 'Test User' } },
    signOut: vi.fn(),
  }),
}));

vi.mock('@/hooks/useSecurityViolations', () => ({
  useUnreadViolationsCount: () => ({
    data: 5,
  }),
}));

vi.mock('@/components/ThemeProvider', () => ({
  useTheme: () => ({
    theme: 'dark',
    setTheme: vi.fn(),
  }),
}));

// Wrapper component
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Header', () => {
  describe('rendering', () => {
    it('should render the header element', () => {
      render(<Header />, { wrapper: createWrapper() });
      
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('should render search input', () => {
      render(<Header />, { wrapper: createWrapper() });
      
      expect(screen.getByPlaceholderText(/Buscar funcionários/i)).toBeInTheDocument();
    });

    it('should render theme toggle button', () => {
      render(<Header />, { wrapper: createWrapper() });
      
      expect(screen.getByRole('button', { name: /Ativar modo claro/i })).toBeInTheDocument();
    });

    it('should render notifications button', () => {
      render(<Header />, { wrapper: createWrapper() });
      
      expect(screen.getByRole('button', { name: /Notificações/i })).toBeInTheDocument();
    });

    it('should render user menu button', () => {
      render(<Header />, { wrapper: createWrapper() });
      
      expect(screen.getByRole('button', { name: /Menu do usuário/i })).toBeInTheDocument();
    });
  });

  describe('notifications', () => {
    it('should show unread count badge', () => {
      render(<Header />, { wrapper: createWrapper() });
      
      // Badge shows "5" from mock
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should include count in aria-label', () => {
      render(<Header />, { wrapper: createWrapper() });
      
      const button = screen.getByRole('button', { name: /Notificações, 5 não lidas/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('search functionality', () => {
    it('should update search input value', () => {
      render(<Header />, { wrapper: createWrapper() });
      
      const searchInput = screen.getByPlaceholderText(/Buscar funcionários/i);
      fireEvent.change(searchInput, { target: { value: 'John' } });
      
      expect(searchInput).toHaveValue('John');
    });

    it('should have search role on form', () => {
      render(<Header />, { wrapper: createWrapper() });
      
      expect(screen.getByRole('search')).toBeInTheDocument();
    });
  });

  describe('theme toggle', () => {
    it('should have correct aria-pressed state', () => {
      render(<Header />, { wrapper: createWrapper() });
      
      const themeButton = screen.getByRole('button', { name: /Ativar modo claro/i });
      expect(themeButton).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('user menu', () => {
    it('should open dropdown on click', async () => {
      render(<Header />, { wrapper: createWrapper() });
      
      const userButton = screen.getByRole('button', { name: /Menu do usuário/i });
      fireEvent.click(userButton);
      
      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });
    });

    it('should show user email in dropdown', async () => {
      render(<Header />, { wrapper: createWrapper() });
      
      const userButton = screen.getByRole('button', { name: /Menu do usuário/i });
      fireEvent.click(userButton);
      
      await waitFor(() => {
        expect(screen.getByText('test@example.com')).toBeInTheDocument();
      });
    });

    it('should have Configurações menu item', async () => {
      render(<Header />, { wrapper: createWrapper() });
      
      const userButton = screen.getByRole('button', { name: /Menu do usuário/i });
      fireEvent.click(userButton);
      
      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: /Configurações/i })).toBeInTheDocument();
      });
    });

    it('should have Sair menu item', async () => {
      render(<Header />, { wrapper: createWrapper() });
      
      const userButton = screen.getByRole('button', { name: /Menu do usuário/i });
      fireEvent.click(userButton);
      
      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: /Sair/i })).toBeInTheDocument();
      });
    });
  });

  describe('accessibility', () => {
    it('should have banner role', () => {
      render(<Header />, { wrapper: createWrapper() });
      
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('should have skip link for keyboard users', () => {
      render(<Header />, { wrapper: createWrapper() });
      
      const skipLink = screen.getByText(/Pular para o conteúdo principal/i);
      expect(skipLink).toHaveClass('sr-only');
    });

    it('should have correct aria-label on search', () => {
      render(<Header />, { wrapper: createWrapper() });
      
      const searchInput = screen.getByRole('searchbox');
      expect(searchInput).toHaveAttribute('aria-label', 'Buscar funcionários');
    });

    it('should have aria-haspopup on user menu', () => {
      render(<Header />, { wrapper: createWrapper() });
      
      const userButton = screen.getByRole('button', { name: /Menu do usuário/i });
      expect(userButton).toHaveAttribute('aria-haspopup', 'menu');
    });
  });

  describe('mobile menu', () => {
    it('should render mobile menu button', () => {
      render(<Header />, { wrapper: createWrapper() });
      
      const mobileButton = screen.getByRole('button', { name: /Abrir menu de navegação/i });
      expect(mobileButton).toBeInTheDocument();
    });

    it('should toggle aria-expanded on mobile menu', () => {
      render(<Header />, { wrapper: createWrapper() });
      
      const mobileButton = screen.getByRole('button', { name: /Abrir menu de navegação/i });
      expect(mobileButton).toHaveAttribute('aria-expanded', 'false');
      
      fireEvent.click(mobileButton);
      expect(mobileButton).toHaveAttribute('aria-expanded', 'true');
    });
  });
});
