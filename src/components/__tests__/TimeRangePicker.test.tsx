import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TimeRangePicker } from '../TimeRangePicker';
describe('TimeRangePicker', () => {
  it('renders', () => { render(<TimeRangePicker onChange={vi.fn()} />); expect(screen.getByRole('textbox')).toBeInTheDocument(); });
  it('opens picker', () => { render(<TimeRangePicker onChange={vi.fn()} />); fireEvent.click(screen.getByRole('textbox')); expect(screen.getByTestId('time-picker')).toBeInTheDocument(); });
  it('selects time', () => { const onChange = vi.fn(); render(<TimeRangePicker onChange={onChange} />); fireEvent.click(screen.getByRole('textbox')); fireEvent.click(screen.getByText('09:00')); expect(onChange).toHaveBeenCalled(); });
});