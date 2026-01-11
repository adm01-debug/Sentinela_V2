import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ScreenshotViewer } from '../ScreenshotViewer';
describe('ScreenshotViewer', () => {
  const ss = { url: '/ss.jpg', timestamp: '2026-01-01T10:00:00Z', employee: 'John' };
  it('renders', () => { render(<ScreenshotViewer screenshot={ss} onClose={vi.fn()} />); expect(screen.getByRole('img')).toBeInTheDocument(); });
  it('shows meta', () => { render(<ScreenshotViewer screenshot={ss} onClose={vi.fn()} />); expect(screen.getByText('John')).toBeInTheDocument(); });
  it('closes', () => { const onClose = vi.fn(); render(<ScreenshotViewer screenshot={ss} onClose={onClose} />); fireEvent.click(screen.getByRole('button', { name: /close/i })); expect(onClose).toHaveBeenCalled(); });
});