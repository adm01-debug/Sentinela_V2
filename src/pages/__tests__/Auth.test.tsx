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
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
    h3: ({ children, ...props }: any) => <h3 {...props}>{children}</h3>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock useAuthPage
const mockUseAuthPage = {
  mode: 'login',
  email: '',
  password: '',
  name: '',
  company: '',
  setMode: vi.fn(),
  setEmail: vi.fn(),
  setPassword: vi.fn(),
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

// Mock useAuth
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
  });

  it('switches to register mode', () => {
    mockUseAuthPage.mode = 'register';
    
    render(
      <BrowserRouter>
        <Auth />
      </BrowserRouter>
    );

    expect(screen.getByText('Crie sua conta')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Seu nome')).toBeInTheDocument();
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
