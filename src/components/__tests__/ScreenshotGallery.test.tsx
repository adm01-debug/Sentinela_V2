import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ScreenshotGallery } from '../ScreenshotGallery';
describe('ScreenshotGallery', () => {
  const screenshots = [{ id: '1', url: '/ss1.jpg', timestamp: '2026-01-01T10:00:00Z' }];
  it('renders', () => { render(<ScreenshotGallery screenshots={screenshots} />); expect(screen.getByRole('img')).toBeInTheDocument(); });
  it('opens lightbox', () => { render(<ScreenshotGallery screenshots={screenshots} />); fireEvent.click(screen.getByRole('img')); expect(screen.getByTestId('lightbox')).toBeInTheDocument(); });
  it('empty state', () => { render(<ScreenshotGallery screenshots={[]} />); expect(screen.getByText(/no screenshots/i)).toBeInTheDocument(); });
});