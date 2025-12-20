import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TeamStatsCards } from '../teams/TeamStatsCards';

const mockStats = {
  total: 10,
  active: 8,
  totalMembers: 150,
  withManager: 7,
};

describe('TeamStatsCards', () => {
  it('renders total teams', () => {
    render(<TeamStatsCards stats={mockStats} />);
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('renders active teams', () => {
    render(<TeamStatsCards stats={mockStats} />);
    expect(screen.getByText('8')).toBeInTheDocument();
  });

  it('renders total members', () => {
    render(<TeamStatsCards stats={mockStats} />);
    expect(screen.getByText('150')).toBeInTheDocument();
  });

  it('renders teams with manager', () => {
    render(<TeamStatsCards stats={mockStats} />);
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('shows card titles', () => {
    render(<TeamStatsCards stats={mockStats} />);
    expect(screen.getByText('Total Equipes')).toBeInTheDocument();
    expect(screen.getByText('Membros')).toBeInTheDocument();
  });
});
