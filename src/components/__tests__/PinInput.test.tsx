import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PinInput } from '../PinInput';
describe('PinInput', () => {
  it('renders', () => { render(<PinInput length={6} onComplete={vi.fn()} />); expect(screen.getAllByRole('textbox')).toHaveLength(6); });
  it('completes', () => { const fn = vi.fn(); render(<PinInput length={4} onComplete={fn} />); const inputs = screen.getAllByRole('textbox'); inputs.forEach((input, i) => fireEvent.change(input, { target: { value: String(i+1) } })); expect(fn).toHaveBeenCalled(); });
});