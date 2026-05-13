import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Auth from '../Auth';
import { BrowserRouter } from 'react-router-dom';

// Mocks
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'pt-BR' },
  }),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

const mockUseAuthPage = {
  mode: 'login',
  email: '',
  password: '',
  name: '',
  company: '',
  setMode: vi.fn(),
  setEmail: (val: string) => { mockUseAuthPage.email = val; },
  setPassword: (val: string) => { mockUseAuthPage.password = val; },
  setName: vi.fn(),
  setCompany: vi.fn(),
  handleLogin: vi.fn(),
  handleRegister: vi.fn(),
  handleForgot: vi.fn(),
  handleReset: vi.fn(),
  isLoading: false,
};

vi.mock('@/hooks/useAuthPage', () => ({
  useAuthPage: () => mockUseAuthPage,
}));

const mockUseAuth = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
};

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth,
}));

describe('Auth Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuthPage.mode = 'login';
    mockUseAuthPage.email = '';
    mockUseAuthPage.password = '';
    mockUseAuth.isAuthenticated = false;
  });

  it('renders login mode by default', () => {
    render(
      <BrowserRouter>
        <Auth />
      </BrowserRouter>
    );

    expect(screen.getByText('Bem-vindo de volta')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('seu@email.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
  });

  it('validates email correctly', async () => {
    const { rerender } = render(
      <BrowserRouter>
        <Auth />
      </BrowserRouter>
    );

    const emailInput = screen.getByPlaceholderText('seu@email.com');
    const submitButton = screen.getByRole('button', { name: /^Entrar$/ });

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    
    // We need to trigger the submit
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Email inválido/i)).toBeInTheDocument();
    });
  });

  it('switches to register mode', async () => {
    mockUseAuthPage.mode = 'register';
    
    render(
      <BrowserRouter>
        <Auth />
      </BrowserRouter>
    );

    expect(screen.getByText('Crie sua conta')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Seu nome')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Nome da empresa')).toBeInTheDocument();
  });

  it('calls login function on submit in login mode', async () => {
    mockUseAuthPage.mode = 'login';
    mockUseAuthPage.email = 'test@example.com';
    mockUseAuthPage.password = 'Password123!';

    render(
      <BrowserRouter>
        <Auth />
      </BrowserRouter>
    );

    const submitButton = screen.getByRole('button', { name: /^Entrar$/ });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockUseAuthPage.handleLogin).toHaveBeenCalled();
    });
  });

  it('redirects if authenticated', () => {
    mockUseAuth.isAuthenticated = true;
    
    render(
      <BrowserRouter>
        <Auth />
      </BrowserRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
  });
});
