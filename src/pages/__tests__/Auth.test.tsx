import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Auth from '../Auth';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';

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
    h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Create a stateful mock for useAuthPage
const useAuthPageStore = {
  mode: 'login',
  email: '',
  password: '',
  name: '',
  company: '',
  isLoading: false,
  handleLogin: vi.fn(),
  handleRegister: vi.fn(),
  handleForgot: vi.fn(),
  handleReset: vi.fn(),
};

vi.mock('@/hooks/useAuthPage', () => ({
  useAuthPage: () => {
    const [state, setState] = React.useState(useAuthPageStore);
    
    // Update the store functions to trigger state updates if needed
    // or just return the state and setters
    return {
      ...state,
      setMode: (mode: any) => setState(s => ({ ...s, mode })),
      setEmail: (email: any) => setState(s => ({ ...s, email })),
      setPassword: (password: any) => setState(s => ({ ...s, password })),
      setName: (name: any) => setState(s => ({ ...s, name })),
      setCompany: (company: any) => setState(s => ({ ...s, company })),
      handleLogin: useAuthPageStore.handleLogin,
      handleRegister: useAuthPageStore.handleRegister,
      handleForgot: useAuthPageStore.handleForgot,
      handleReset: useAuthPageStore.handleReset,
    };
  },
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
    useAuthPageStore.mode = 'login';
    useAuthPageStore.email = '';
    useAuthPageStore.password = '';
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
    render(
      <BrowserRouter>
        <Auth />
      </BrowserRouter>
    );

    const emailInput = screen.getByPlaceholderText('seu@email.com');
    const submitButton = screen.getByRole('button', { name: /^Entrar$/ });

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email inválido')).toBeInTheDocument();
    });
  });

  it('switches to register mode', async () => {
    useAuthPageStore.mode = 'register';
    
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
    useAuthPageStore.mode = 'login';
    // We can't easily set the initial state of the hook from here since it uses internal state
    // but we can trigger changes via fireEvent
    
    render(
      <BrowserRouter>
        <Auth />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('seu@email.com'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'Password123!' } });
    
    const submitButton = screen.getByRole('button', { name: /^Entrar$/ });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(useAuthPageStore.handleLogin).toHaveBeenCalled();
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
