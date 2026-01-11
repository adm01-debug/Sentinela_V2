import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PhoneInput } from '../PhoneInput';
describe('PhoneInput', () => {
  it('renders', () => { render(<PhoneInput value="" onChange={vi.fn()} />); expect(screen.getByRole('textbox')).toBeInTheDocument(); });
  it('formats', () => { const fn = vi.fn(); render(<PhoneInput value="" onChange={fn} />); fireEvent.change(screen.getByRole('textbox'), { target: { value: '11999998888' } }); expect(fn).toHaveBeenCalled(); });
});