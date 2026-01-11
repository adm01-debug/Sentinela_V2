import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MultiSelect } from '../MultiSelect';
describe('MultiSelect', () => {
  const options = [{ value: '1', label: 'One' }, { value: '2', label: 'Two' }];
  it('renders', () => { render(<MultiSelect options={options} value={[]} onChange={vi.fn()} />); expect(screen.getByRole('combobox')).toBeInTheDocument(); });
  it('selects', () => { const fn = vi.fn(); render(<MultiSelect options={options} value={[]} onChange={fn} />); fireEvent.click(screen.getByRole('combobox')); fireEvent.click(screen.getByText('One')); expect(fn).toHaveBeenCalledWith(['1']); });
});