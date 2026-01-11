import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DurationPicker } from '../DurationPicker';
describe('DurationPicker', () => {
  it('renders', () => { render(<DurationPicker value={3600} onChange={vi.fn()} />); expect(screen.getByText('1h 0m')).toBeInTheDocument(); });
  it('changes value', () => { const onChange = vi.fn(); render(<DurationPicker value={0} onChange={onChange} />); fireEvent.click(screen.getByText('+1h')); expect(onChange).toHaveBeenCalledWith(3600); });
});