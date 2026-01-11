import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FloatingButton } from '../FloatingButton';
describe('FloatingButton', () => {
  it('renders', () => { render(<FloatingButton icon="plus" onClick={vi.fn()} />); expect(screen.getByRole('button')).toBeInTheDocument(); });
  it('handles click', () => { const onClick = vi.fn(); render(<FloatingButton icon="plus" onClick={onClick} />); fireEvent.click(screen.getByRole('button')); expect(onClick).toHaveBeenCalled(); });
  it('positions correctly', () => { const { container } = render(<FloatingButton icon="plus" position="bottom-right" onClick={vi.fn()} />); expect(container.firstChild).toHaveClass('bottom-right'); });
});