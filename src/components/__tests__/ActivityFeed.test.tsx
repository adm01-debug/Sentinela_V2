import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActivityFeed } from '../ActivityFeed';

describe('ActivityFeed', () => {
  const mockActivities = [
    { id: '1', type: 'login', user: 'John', timestamp: '2026-01-01T10:00:00Z' },
    { id: '2', type: 'action', user: 'Jane', timestamp: '2026-01-01T11:00:00Z' },
  ];

  it('renders activity list', () => {
    render(<ActivityFeed activities={mockActivities} />);
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('Jane')).toBeInTheDocument();
  });

  it('displays empty state when no activities', () => {
    render(<ActivityFeed activities={[]} />);
    expect(screen.getByText(/no activities/i)).toBeInTheDocument();
  });

  it('sorts activities by timestamp', () => {
    render(<ActivityFeed activities={mockActivities} />);
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
  });

  it('handles load more', async () => {
    const onLoadMore = vi.fn();
    render(<ActivityFeed activities={mockActivities} onLoadMore={onLoadMore} hasMore />);
    fireEvent.click(screen.getByText(/load more/i));
    expect(onLoadMore).toHaveBeenCalled();
  });

  it('filters activities by type', () => {
    render(<ActivityFeed activities={mockActivities} filterType="login" />);
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.queryByText('Jane')).not.toBeInTheDocument();
  });
});
