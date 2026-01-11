import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActivityTimeline } from '../ActivityTimeline';

describe('ActivityTimeline', () => {
  const mockEvents = [
    { id: '1', title: 'Login', time: '10:00', type: 'auth' },
    { id: '2', title: 'File Access', time: '10:30', type: 'file' },
    { id: '3', title: 'Logout', time: '18:00', type: 'auth' },
  ];

  it('renders timeline events', () => {
    render(<ActivityTimeline events={mockEvents} />);
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('File Access')).toBeInTheDocument();
  });

  it('groups events by date', () => {
    render(<ActivityTimeline events={mockEvents} groupByDate />);
    expect(screen.getByTestId('timeline-group')).toBeInTheDocument();
  });

  it('expands event details on click', () => {
    render(<ActivityTimeline events={mockEvents} expandable />);
    fireEvent.click(screen.getByText('Login'));
    expect(screen.getByTestId('event-details')).toBeInTheDocument();
  });

  it('filters by event type', () => {
    render(<ActivityTimeline events={mockEvents} filter="auth" />);
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.queryByText('File Access')).not.toBeInTheDocument();
  });

  it('handles empty state', () => {
    render(<ActivityTimeline events={[]} />);
    expect(screen.getByText(/no events/i)).toBeInTheDocument();
  });

  it('supports infinite scroll', () => {
    const onLoadMore = vi.fn();
    render(<ActivityTimeline events={mockEvents} onLoadMore={onLoadMore} hasMore />);
    expect(screen.getByTestId('load-more-trigger')).toBeInTheDocument();
  });
});
