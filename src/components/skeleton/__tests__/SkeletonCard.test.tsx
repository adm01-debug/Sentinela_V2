import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { SkeletonCard, SkeletonTable, SkeletonList } from '../SkeletonCard';

describe('Skeleton components', () => {
  it('should render SkeletonCard', () => {
    const { container } = render(<SkeletonCard />);
    expect(container.querySelector('[class*="animate-pulse"]')).toBeTruthy();
  });

  it('should render SkeletonTable with correct rows', () => {
    const { container } = render(<SkeletonTable rows={3} />);
    expect(container.querySelectorAll('[class*="animate-pulse"]').length).toBeGreaterThanOrEqual(3);
  });

  it('should render SkeletonList with correct items', () => {
    const { container } = render(<SkeletonList items={4} />);
    expect(container.querySelectorAll('[class*="rounded-full"]').length).toBe(4);
  });
});
