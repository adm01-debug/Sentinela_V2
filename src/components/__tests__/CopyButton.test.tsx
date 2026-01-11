import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CopyButton } from '../CopyButton';
describe('CopyButton', () => {
  it('renders', () => { render(<CopyButton text="Copy me" />); expect(screen.getByRole('button')).toBeInTheDocument(); });
  it('copies text', () => { const writeText = vi.fn(); Object.assign(navigator, { clipboard: { writeText } }); render(<CopyButton text="Copy me" />); fireEvent.click(screen.getByRole('button')); expect(writeText).toHaveBeenCalledWith('Copy me'); });
  it('shows copied state', async () => { render(<CopyButton text="test" />); fireEvent.click(screen.getByRole('button')); expect(await screen.findByText(/copied/i)).toBeInTheDocument(); });
});