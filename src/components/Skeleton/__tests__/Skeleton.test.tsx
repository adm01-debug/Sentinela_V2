import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Skeleton } from '../Skeleton';

describe('Skeleton', () => {
  it('renders text skeleton', () => {
    render(<Skeleton variant="text" />);
    expect(screen.getByTestId('skeleton')).toHaveClass('text');
  });

  it('renders circle skeleton', () => {
    render(<Skeleton variant="circle" />);
    expect(screen.getByTestId('skeleton')).toHaveClass('circle');
  });

  it('renders rectangle skeleton', () => {
    render(<Skeleton variant="rectangle" />);
    expect(screen.getByTestId('skeleton')).toHaveClass('rectangle');
  });

  it('applies custom dimensions', () => {
    render(<Skeleton width={200} height={100} />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveStyle({ width: '200px', height: '100px' });
  });
});