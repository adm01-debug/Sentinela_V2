import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ColorPicker } from '../ColorPicker';
describe('ColorPicker', () => {
  it('renders', () => { render(<ColorPicker value="#ff0000" onChange={vi.fn()} />); expect(screen.getByTestId('color-picker')).toBeInTheDocument(); });
  it('shows value', () => { render(<ColorPicker value="#ff0000" onChange={vi.fn()} />); expect(screen.getByDisplayValue('#ff0000')).toBeInTheDocument(); });
  it('changes color', () => { const onChange = vi.fn(); render(<ColorPicker value="#ff0000" onChange={onChange} />); fireEvent.change(screen.getByRole('textbox'), { target: { value: '#00ff00' } }); expect(onChange).toHaveBeenCalledWith('#00ff00'); });
});