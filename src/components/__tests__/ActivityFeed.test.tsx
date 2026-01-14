import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ActivityFeed, ActivityItem } from '../ActivityFeed';

describe('ActivityFeed', () => {
  const mockActivities: ActivityItem[] = [
    { 
      id: '1', 
      type: 'login', 
      title: 'User logged in',
      timestamp: new Date(),
      user: { name: 'John' }
    },
    { 
      id: '2', 
      type: 'logout', 
      title: 'User logged out',
      timestamp: new Date(),
      user: { name: 'Jane' }
    },
  ];

  it('renders activity list', () => {
    render(<ActivityFeed activities={mockActivities} />);
    expect(screen.getByText('User logged in')).toBeInTheDocument();
  });

  it('displays empty state when no activities', () => {
    render(<ActivityFeed activities={[]} />);
    expect(screen.getByText('Nenhuma atividade encontrada')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<ActivityFeed activities={[]} isLoading />);
    // Loading skeleton should render with animate-pulse
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('shows custom empty message', () => {
    render(<ActivityFeed activities={[]} emptyMessage="Custom empty message" />);
    expect(screen.getByText('Custom empty message')).toBeInTheDocument();
  });
});
