import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { IconButton } from '../IconButton';
describe('IconButton', () => {
  it('renders', () => { render(<IconButton icon="edit" onClick={vi.fn()} />); expect(screen.getByRole('button')).toBeInTheDocument(); });
  it('clicks', () => { const fn = vi.fn(); render(<IconButton icon="edit" onClick={fn} />); fireEvent.click(screen.getByRole('button')); expect(fn).toHaveBeenCalled(); });
});