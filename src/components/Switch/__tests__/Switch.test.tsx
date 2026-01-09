import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Switch } from '../Switch';

describe('Switch', () => {
  it('renders with label', () => {
    render(<Switch label="Enable feature" />);
    expect(screen.getByLabelText('Enable feature')).toBeInTheDocument();
  });

  it('handles toggle', () => {
    const onChange = vi.fn();
    render(<Switch label="Toggle" onChange={onChange} />);
    fireEvent.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalled();
  });

  it('supports checked state', () => {
    render(<Switch label="On" checked />);
    expect(screen.getByRole('switch')).toBeChecked();
  });

  it('supports disabled state', () => {
    render(<Switch label="Disabled" disabled />);
    expect(screen.getByRole('switch')).toBeDisabled();
  });
});