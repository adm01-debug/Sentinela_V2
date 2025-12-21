import { render, screen, fireEvent } from '@testing-library/react';
import { A11yButton } from '../a11y-button';

describe('A11yButton', () => {
  it('should render correctly', () => {
    render(<A11yButton>Click me</A11yButton>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should handle click events', () => {
    const handleClick = vi.fn();
    render(<A11yButton onClick={handleClick}>Click me</A11yButton>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });

  it('should be accessible', () => {
    render(<A11yButton aria-label="Test button">Click</A11yButton>);
    expect(screen.getByLabelText('Test button')).toBeInTheDocument();
  });

  it('should support disabled state', () => {
    render(<A11yButton disabled>Disabled</A11yButton>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should apply custom className', () => {
    render(<A11yButton className="custom">Test</A11yButton>);
    expect(screen.getByRole('button')).toHaveClass('custom');
  });
});
