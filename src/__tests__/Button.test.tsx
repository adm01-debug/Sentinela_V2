import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '../components/ui/Button';

describe('Button', () => {
  it('renders children', () => { render(<Button>Click me</Button>); expect(screen.getByText('Click me')).toBeInTheDocument(); });
  it('shows loading state', () => { render(<Button loading>Submit</Button>); expect(screen.getByRole('button')).toBeDisabled(); });
  it('applies variant classes', () => { render(<Button variant="destructive">Delete</Button>); expect(screen.getByRole('button')).toHaveClass('bg-destructive'); });
});