import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ActivityTimeline } from '../ActivityTimeline';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('ActivityTimeline', () => {
  // ActivityTimeline expects 'activities' prop with TimelineActivity objects
  const mockActivities = [
    { id: '1', timestamp: '2026-01-01T10:00:00Z', application: 'Chrome', title: 'Opened browser', duration: 3600 },
    { id: '2', timestamp: '2026-01-01T10:30:00Z', application: 'VS Code', title: 'Editing file', duration: 1800 },
    { id: '3', timestamp: '2026-01-01T18:00:00Z', application: 'Slack', title: 'Messaging', duration: 600 },
  ];

  it('renders timeline activities', () => {
    render(<ActivityTimeline activities={mockActivities} />, { wrapper });
    expect(screen.getByText('Chrome')).toBeInTheDocument();
    expect(screen.getByText('VS Code')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<ActivityTimeline isLoading />, { wrapper });
    // Should show skeleton loaders
    expect(document.querySelectorAll('[class*="skeleton"], [class*="Skeleton"]').length).toBeGreaterThan(0);
  });

  it('handles empty activities', () => {
    render(<ActivityTimeline activities={[]} />, { wrapper });
    // Component renders container without errors
    expect(document.querySelector('.space-y-4')).toBeInTheDocument();
  });

  it('displays activity details', () => {
    render(<ActivityTimeline activities={mockActivities} />, { wrapper });
    expect(screen.getByText('Opened browser')).toBeInTheDocument();
  });
});
