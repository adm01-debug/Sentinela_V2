import { render, screen } from '@testing-library/react';
import { Alert, AlertTitle, AlertDescription } from '../alert';

describe('Alert', () => {
  it('should render alert with title and description', () => {
    render(
      <Alert>
        <AlertTitle>Test Title</AlertTitle>
        <AlertDescription>Test Description</AlertDescription>
      </Alert>
    );
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('should apply variant classes', () => {
    render(<Alert variant="destructive">Error</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('destructive');
  });

  it('should be accessible', () => {
    render(<Alert>Content</Alert>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<Alert className="custom">Content</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('custom');
  });
});
