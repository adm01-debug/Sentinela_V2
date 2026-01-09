import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Card } from '../Card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('renders with title', () => {
    render(<Card title="Card Title">Content</Card>);
    expect(screen.getByText('Card Title')).toBeInTheDocument();
  });

  it('renders footer', () => {
    render(<Card footer="Footer text">Content</Card>);
    expect(screen.getByText('Footer text')).toBeInTheDocument();
  });

  it('applies hoverable styles', () => {
    render(<Card hoverable>Content</Card>);
    expect(screen.getByTestId('card')).toHaveClass('hoverable');
  });
});