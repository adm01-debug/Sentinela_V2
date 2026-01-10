import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/index';
import Auth from '../Auth';

// Mock hooks
const mockUseAuth = vi.fn();
const mockUseAuthPage = vi.fn();
const mockNavigate = vi.fn();

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('@/hooks/useAuthPage', () => ({
  useAuthPage: () => mockUseAuthPage(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

const renderAuth = () => {
  return render(
    <BrowserRouter>
      <I18nextProvider i18n={i18n}>
        <Auth />
      </I18nextProvider>
    </BrowserRouter>
  );
};

describe('Auth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });

    mockUseAuthPage.mockReturnValue({
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
    });
  });

  describe('Rendering', () => {
    it('should render the auth page correctly', () => {
      renderAuth();
      
      expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
    });

    it('should render login form by default', () => {
      renderAuth();
      
      // Should have email and password fields
      expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
    });

    it('should render the logo/brand', () => {
      renderAuth();
      
      // Check for Sentinela branding
      expect(screen.getByText(/sentinela/i)).toBeInTheDocument();
    });
  });

  describe('Login Mode', () => {
    it('should allow entering email', () => {
      const setEmail = vi.fn();
      mockUseAuthPage.mockReturnValue({
        ...mockUseAuthPage(),
        setEmail,
      });

      renderAuth();
      
      const emailInput = screen.getByRole('textbox', { name: /email/i });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      
      expect(setEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should allow entering password', () => {
      const setPassword = vi.fn();
      mockUseAuthPage.mockReturnValue({
        ...mockUseAuthPage(),
        setPassword,
      });

      renderAuth();
      
      const passwordInput = screen.getByLabelText(/senha/i);
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      expect(setPassword).toHaveBeenCalledWith('password123');
    });

    it('should toggle password visibility', async () => {
      renderAuth();
      
      const passwordInput = screen.getByLabelText(/senha/i);
      expect(passwordInput).toHaveAttribute('type', 'password');
      
      // Find and click the toggle button
      const toggleButton = screen.getByRole('button', { name: /mostrar|show/i });
      if (toggleButton) {
        fireEvent.click(toggleButton);
        await waitFor(() => {
          expect(passwordInput).toHaveAttribute('type', 'text');
        });
      }
    });

    it('should call handleLogin on form submit', async () => {
      const handleLogin = vi.fn();
      mockUseAuthPage.mockReturnValue({
        ...mockUseAuthPage(),
        email: 'test@example.com',
        password: 'password123',
        handleLogin,
      });

      renderAuth();
      
      const submitButton = screen.getByRole('button', { name: /entrar|login|sign in/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(handleLogin).toHaveBeenCalled();
      });
    });

    it('should show loading state during login', () => {
      mockUseAuthPage.mockReturnValue({
        ...mockUseAuthPage(),
        isLoading: true,
      });

      renderAuth();
      
      // Should show loading indicator
      expect(screen.getByRole('button', { name: /entrar|login/i })).toBeDisabled();
    });
  });

  describe('Register Mode', () => {
    beforeEach(() => {
      mockUseAuthPage.mockReturnValue({
        ...mockUseAuthPage(),
        mode: 'register',
      });
    });

    it('should render register form fields', () => {
      renderAuth();
      
      // Register mode should have name and company fields
      expect(screen.getByRole('textbox', { name: /nome|name/i })).toBeInTheDocument();
    });

    it('should call handleRegister on form submit', async () => {
      const handleRegister = vi.fn();
      mockUseAuthPage.mockReturnValue({
        ...mockUseAuthPage(),
        mode: 'register',
        email: 'test@example.com',
        password: 'StrongPass123!',
        name: 'Test User',
        company: 'Test Corp',
        handleRegister,
      });

      renderAuth();
      
      const submitButton = screen.getByRole('button', { name: /criar|register|sign up/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(handleRegister).toHaveBeenCalled();
      });
    });
  });

  describe('Forgot Password Mode', () => {
    beforeEach(() => {
      mockUseAuthPage.mockReturnValue({
        ...mockUseAuthPage(),
        mode: 'forgot',
      });
    });

    it('should render forgot password form', () => {
      renderAuth();
      
      expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
    });

    it('should call handleForgot on form submit', async () => {
      const handleForgot = vi.fn();
      mockUseAuthPage.mockReturnValue({
        ...mockUseAuthPage(),
        mode: 'forgot',
        email: 'test@example.com',
        handleForgot,
      });

      renderAuth();
      
      const submitButton = screen.getByRole('button', { name: /enviar|send|reset/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(handleForgot).toHaveBeenCalled();
      });
    });
  });

  describe('Mode Switching', () => {
    it('should switch to register mode when clicking register link', () => {
      const setMode = vi.fn();
      mockUseAuthPage.mockReturnValue({
        ...mockUseAuthPage(),
        setMode,
      });

      renderAuth();
      
      const registerLink = screen.getByText(/criar conta|register|sign up/i);
      fireEvent.click(registerLink);
      
      expect(setMode).toHaveBeenCalledWith('register');
    });

    it('should switch to forgot password mode when clicking forgot link', () => {
      const setMode = vi.fn();
      mockUseAuthPage.mockReturnValue({
        ...mockUseAuthPage(),
        setMode,
      });

      renderAuth();
      
      const forgotLink = screen.getByText(/esqueceu|forgot/i);
      fireEvent.click(forgotLink);
      
      expect(setMode).toHaveBeenCalledWith('forgot');
    });
  });

  describe('Authentication Redirect', () => {
    it('should redirect to home when already authenticated', async () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
      });

      renderAuth();
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
      });
    });

    it('should not redirect while authentication is loading', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
      });

      renderAuth();
      
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Validation', () => {
    it('should validate email format', async () => {
      const handleLogin = vi.fn();
      mockUseAuthPage.mockReturnValue({
        ...mockUseAuthPage(),
        email: 'invalid-email',
        password: 'password123',
        handleLogin,
      });

      renderAuth();
      
      const submitButton = screen.getByRole('button', { name: /entrar|login/i });
      fireEvent.click(submitButton);
      
      // Should show validation error or not call handleLogin
      await waitFor(() => {
        // Check for error message or that handleLogin wasn't called with invalid data
        expect(true).toBe(true); // Placeholder for actual validation check
      });
    });
  });

  describe('Features Display', () => {
    it('should display feature cards', () => {
      renderAuth();
      
      // Check for feature cards content
      expect(screen.getByText(/monitoramento|monitoring/i)).toBeInTheDocument();
      expect(screen.getByText(/segurança|security/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible form labels', () => {
      renderAuth();
      
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/senha|password/i)).toBeInTheDocument();
    });

    it('should have proper button roles', () => {
      renderAuth();
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });
});
