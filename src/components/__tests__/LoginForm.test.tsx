import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from '../LoginForm';
describe('LoginForm', () => {
  it('renders form', () => { render(<LoginForm onSubmit={vi.fn()} />); expect(screen.getByLabelText(/email/i)).toBeInTheDocument(); expect(screen.getByLabelText(/password/i)).toBeInTheDocument(); });
  it('validates email', async () => { render(<LoginForm onSubmit={vi.fn()} />); fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'invalid' } }); fireEvent.click(screen.getByRole('button', { name: /login/i })); await waitFor(() => expect(screen.getByText(/invalid email/i)).toBeInTheDocument()); });
  it('submits form', async () => { const onSubmit = vi.fn(); render(<LoginForm onSubmit={onSubmit} />); fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@test.com' } }); fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } }); fireEvent.click(screen.getByRole('button', { name: /login/i })); await waitFor(() => expect(onSubmit).toHaveBeenCalled()); });
  it('shows loading state', () => { render(<LoginForm onSubmit={vi.fn()} loading />); expect(screen.getByRole('button', { name: /login/i })).toBeDisabled(); });
});