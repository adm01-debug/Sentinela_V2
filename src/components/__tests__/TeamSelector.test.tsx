import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TeamSelector } from '../TeamSelector';
describe('TeamSelector', () => {
  const teams = [{ id: '1', name: 'Engineering' }, { id: '2', name: 'Sales' }];
  it('renders', () => { render(<TeamSelector teams={teams} value="1" onChange={vi.fn()} />); expect(screen.getByRole('combobox')).toBeInTheDocument(); });
  it('shows selected', () => { render(<TeamSelector teams={teams} value="1" onChange={vi.fn()} />); expect(screen.getByText('Engineering')).toBeInTheDocument(); });
  it('changes team', () => { const onChange = vi.fn(); render(<TeamSelector teams={teams} value="1" onChange={onChange} />); fireEvent.click(screen.getByRole('combobox')); fireEvent.click(screen.getByText('Sales')); expect(onChange).toHaveBeenCalledWith('2'); });
});