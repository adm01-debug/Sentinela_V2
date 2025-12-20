import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TeamCard } from '../teams/TeamCard';

const mockTeam = {
  id: '1',
  name: 'Engineering',
  description: 'Engineering team',
  manager_name: 'John Doe',
  is_active: true,
  members_count: 10,
};

describe('TeamCard', () => {
  const handlers = {
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onViewMembers: vi.fn(),
  };

  beforeEach(() => { vi.clearAllMocks(); });

  it('renders team name', () => {
    render(<TeamCard team={mockTeam} {...handlers} />);
    expect(screen.getByText('Engineering')).toBeInTheDocument();
  });

  it('shows manager name', () => {
    render(<TeamCard team={mockTeam} {...handlers} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('shows members count', () => {
    render(<TeamCard team={mockTeam} {...handlers} />);
    expect(screen.getByText('10 membros')).toBeInTheDocument();
  });

  it('calls onEdit when edit clicked', () => {
    render(<TeamCard team={mockTeam} {...handlers} />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[1]); // Edit button
    expect(handlers.onEdit).toHaveBeenCalledWith(mockTeam);
  });

  it('shows inactive state', () => {
    render(<TeamCard team={{ ...mockTeam, is_active: false }} {...handlers} />);
    expect(screen.getByText('Inativa')).toBeInTheDocument();
  });
});
