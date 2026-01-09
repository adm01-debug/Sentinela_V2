import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Select } from '../Select';

describe('Select', () => {
  const options = [{ value: 'a', label: 'Option A' }, { value: 'b', label: 'Option B' }];

  it('renders options', () => {
    render(<Select options={options} />);
    fireEvent.click(screen.getByRole('combobox'));
    expect(screen.getByText('Option A')).toBeInTheDocument();
  });

  it('handles selection', () => {
    const onChange = vi.fn();
    render(<Select options={options} onChange={onChange} />);
    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(screen.getByText('Option B'));
    expect(onChange).toHaveBeenCalledWith('b');
  });

  it('shows placeholder', () => {
    render(<Select options={options} placeholder="Select..." />);
    expect(screen.getByText('Select...')).toBeInTheDocument();
  });

  it('supports multi-select', () => {
    render(<Select options={options} multiple />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });
});