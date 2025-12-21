import { render, screen } from '@testing-library/react';
import { Badge } from '../badge';

describe('Badge', () => {
  it('should render badge with text', () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('should apply variant classes', () => {
    render(<Badge variant="destructive">Error</Badge>);
    expect(screen.getByText('Error')).toHaveClass('destructive');
  });

  it('should apply secondary variant', () => {
    render(<Badge variant="secondary">Info</Badge>);
    expect(screen.getByText('Info')).toHaveClass('secondary');
  });

  it('should apply outline variant', () => {
    render(<Badge variant="outline">Outline</Badge>);
    expect(screen.getByText('Outline')).toHaveClass('outline');
  });

  it('should apply custom className', () => {
    render(<Badge className="custom">Custom</Badge>);
    expect(screen.getByText('Custom')).toHaveClass('custom');
  });
});
