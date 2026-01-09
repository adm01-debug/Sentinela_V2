import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Divider } from '../Divider';

describe('Divider', () => {
  it('renders horizontal divider', () => {
    render(<Divider />);
    expect(screen.getByRole('separator')).toHaveClass('horizontal');
  });

  it('renders vertical divider', () => {
    render(<Divider orientation="vertical" />);
    expect(screen.getByRole('separator')).toHaveClass('vertical');
  });

  it('renders with text', () => {
    render(<Divider>OR</Divider>);
    expect(screen.getByText('OR')).toBeInTheDocument();
  });

  it('applies variant styles', () => {
    render(<Divider variant="dashed" />);
    expect(screen.getByRole('separator')).toHaveClass('dashed');
  });
});