import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Skeleton } from '../Skeleton';
describe('Skeleton', () => {
  it('renders', () => { render(<Skeleton />); expect(screen.getByTestId('skeleton')).toBeInTheDocument(); });
  it('applies width', () => { render(<Skeleton width={200} />); expect(screen.getByTestId('skeleton')).toHaveStyle({ width: '200px' }); });
  it('applies height', () => { render(<Skeleton height={50} />); expect(screen.getByTestId('skeleton')).toHaveStyle({ height: '50px' }); });
  it('circle variant', () => { render(<Skeleton variant="circle" />); expect(screen.getByTestId('skeleton')).toHaveClass('rounded-full'); });
});