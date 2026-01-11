import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ViolationDetail } from '../ViolationDetail';
describe('ViolationDetail', () => {
  const violation = { id: '1', type: 'policy_breach', severity: 'critical', employee: 'John', description: 'Accessed restricted file', evidence: ['/ss1.jpg'] };
  it('renders', () => { render(<ViolationDetail violation={violation} />); expect(screen.getByText('policy_breach')).toBeInTheDocument(); });
  it('shows description', () => { render(<ViolationDetail violation={violation} />); expect(screen.getByText('Accessed restricted file')).toBeInTheDocument(); });
  it('shows evidence', () => { render(<ViolationDetail violation={violation} />); expect(screen.getByRole('img')).toBeInTheDocument(); });
  it('handles resolve', () => { const onResolve = vi.fn(); render(<ViolationDetail violation={violation} onResolve={onResolve} />); fireEvent.click(screen.getByText(/resolve/i)); expect(onResolve).toHaveBeenCalled(); });
});