import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Alert } from '../Alert';

describe('Alert', () => {
  it('renders message', () => {
    render(<Alert type="info">Info message</Alert>);
    expect(screen.getByText('Info message')).toBeInTheDocument();
  });

  it('renders title', () => {
    render(<Alert type="success" title="Success!">Message</Alert>);
    expect(screen.getByText('Success!')).toBeInTheDocument();
  });

  it('applies type styles', () => {
    render(<Alert type="error">Error</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('error');
  });

  it('handles dismiss', () => {
    const onDismiss = vi.fn();
    render(<Alert type="info" dismissible onDismiss={onDismiss}>Dismissible</Alert>);
    fireEvent.click(screen.getByLabelText('Dismiss'));
    expect(onDismiss).toHaveBeenCalled();
  });
});