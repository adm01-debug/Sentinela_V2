import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NumberInput } from '../NumberInput';
describe('NumberInput', () => {
  it('renders', () => { render(<NumberInput value={10} onChange={vi.fn()} />); expect(screen.getByRole('spinbutton')).toHaveValue(10); });
  it('increments', () => { const fn = vi.fn(); render(<NumberInput value={10} onChange={fn} />); fireEvent.click(screen.getByRole('button', { name: /increment/i })); expect(fn).toHaveBeenCalledWith(11); });
  it('decrements', () => { const fn = vi.fn(); render(<NumberInput value={10} onChange={fn} />); fireEvent.click(screen.getByRole('button', { name: /decrement/i })); expect(fn).toHaveBeenCalledWith(9); });
});