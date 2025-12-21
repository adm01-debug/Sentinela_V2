import { render, screen, fireEvent } from '@testing-library/react';
import { A11yInput } from '../a11y-input';

describe('A11yInput', () => {
  it('should render correctly', () => {
    render(<A11yInput placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('should handle input changes', () => {
    const handleChange = vi.fn();
    render(<A11yInput onChange={handleChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('should be accessible with label', () => {
    render(<A11yInput aria-label="Email input" />);
    expect(screen.getByLabelText('Email input')).toBeInTheDocument();
  });

  it('should support disabled state', () => {
    render(<A11yInput disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('should show error state', () => {
    render(<A11yInput aria-invalid="true" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });
});
