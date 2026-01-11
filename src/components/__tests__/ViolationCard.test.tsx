import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ViolationCard } from '../ViolationCard';
describe('ViolationCard', () => {
  const violation = { id: '1', type: 'unauthorized_access', severity: 'high', employee: 'John', timestamp: '2026-01-01T10:00:00Z' };
  it('renders', () => { render(<ViolationCard violation={violation} />); expect(screen.getByText('unauthorized_access')).toBeInTheDocument(); });
  it('shows severity', () => { render(<ViolationCard violation={violation} />); expect(screen.getByText('high')).toBeInTheDocument(); });
  it('shows employee', () => { render(<ViolationCard violation={violation} />); expect(screen.getByText('John')).toBeInTheDocument(); });
  it('handles view', () => { const onView = vi.fn(); render(<ViolationCard violation={violation} onView={onView} />); fireEvent.click(screen.getByText(/view/i)); expect(onView).toHaveBeenCalled(); });
});