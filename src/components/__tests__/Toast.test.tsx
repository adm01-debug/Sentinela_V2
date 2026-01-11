import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Toast } from '../Toast';
describe('Toast', () => {
  it('renders message', () => { render(<Toast message="Success!" type="success" onClose={vi.fn()} />); expect(screen.getByText('Success!')).toBeInTheDocument(); });
  it('shows success style', () => { const { container } = render(<Toast message="Test" type="success" onClose={vi.fn()} />); expect(container.firstChild).toHaveClass('bg-green'); });
  it('shows error style', () => { const { container } = render(<Toast message="Test" type="error" onClose={vi.fn()} />); expect(container.firstChild).toHaveClass('bg-red'); });
  it('handles close', () => { const onClose = vi.fn(); render(<Toast message="Test" type="info" onClose={onClose} />); fireEvent.click(screen.getByRole('button')); expect(onClose).toHaveBeenCalled(); });
});