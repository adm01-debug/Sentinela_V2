import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ScheduleEditor } from '../ScheduleEditor';
describe('ScheduleEditor', () => {
  const schedule = { monday: { start: '09:00', end: '17:00' } };
  it('renders', () => { render(<ScheduleEditor schedule={schedule} onChange={vi.fn()} />); expect(screen.getByText('Monday')).toBeInTheDocument(); });
  it('updates', () => { const onChange = vi.fn(); render(<ScheduleEditor schedule={schedule} onChange={onChange} />); fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: '08:00' } }); expect(onChange).toHaveBeenCalled(); });
});