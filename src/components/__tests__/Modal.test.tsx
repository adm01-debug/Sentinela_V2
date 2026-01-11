import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from '../Modal';
describe('Modal', () => {
  it('renders when open', () => { render(<Modal open title="Test" onClose={vi.fn()}><div>Content</div></Modal>); expect(screen.getByText('Test')).toBeInTheDocument(); });
  it('closes', () => { const fn = vi.fn(); render(<Modal open title="Test" onClose={fn}><div>Content</div></Modal>); fireEvent.click(screen.getByRole('button', { name: /close/i })); expect(fn).toHaveBeenCalled(); });
});