import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ScreenshotGallery } from '../ScreenshotGallery';

describe('ScreenshotGallery', () => {
  // ScreenshotGallery expects screenshots with { id, url, thumbnailUrl, timestamp }
  const mockScreenshots = [
    {
      id: '1',
      url: '/ss1-full.jpg',
      thumbnailUrl: '/ss1-thumb.jpg',
      timestamp: '2026-01-01T10:00:00Z',
    },
    {
      id: '2',
      url: '/ss2-full.jpg',
      thumbnailUrl: '/ss2-thumb.jpg',
      timestamp: '2026-01-01T11:00:00Z',
    },
  ];

  it('renders gallery images', () => {
    render(<ScreenshotGallery screenshots={mockScreenshots} />);
    expect(screen.getAllByRole('img').length).toBe(2);
  });

  it('handles empty screenshots', () => {
    render(<ScreenshotGallery screenshots={[]} />);
    // Should render empty grid
    const grid = document.querySelector('.grid');
    expect(grid?.children.length).toBe(0);
  });

  it('opens dialog on image click', () => {
    render(<ScreenshotGallery screenshots={mockScreenshots} />);
    fireEvent.click(screen.getAllByRole('img')[0]);
    // Dialog should be visible
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
