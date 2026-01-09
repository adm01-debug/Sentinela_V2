import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Toast } from '../Toast';

describe('Toast', () => {
  it('renders message', () => {
    render(<Toast message="Success!" type="success" />);
    expect(screen.getByText('Success!')).toBeInTheDocument();
  });

  it('renders with title', () => {
    render(<Toast title="Notice" message="Details" type="info" />);
    expect(screen.getByText('Notice')).toBeInTheDocument();
  });

  it('applies type styles', () => {
    render(<Toast message="Error" type="error" />);
    expect(screen.getByTestId('toast')).toHaveClass('error');
  });

  it('auto-dismisses after duration', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    render(<Toast message="Test" onClose={onClose} duration={3000} />);
    act(() => { vi.advanceTimersByTime(3000); });
    expect(onClose).toHaveBeenCalled();
    vi.useRealTimers();
  });
});