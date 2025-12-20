import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AIStatsCards } from '../ai/AIStatsCards';

const mockStats = {
  total: 50,
  avgScore: 78,
  byType: {
    productivity: 20,
    behavior: 15,
    risk: 10,
    summary: 5,
  },
};

describe('AIStatsCards', () => {
  it('renders total analyses', () => {
    render(<AIStatsCards stats={mockStats} />);
    expect(screen.getByText('50')).toBeInTheDocument();
  });

  it('renders average score with percentage', () => {
    render(<AIStatsCards stats={mockStats} />);
    expect(screen.getByText('78%')).toBeInTheDocument();
  });

  it('renders risk analysis count', () => {
    render(<AIStatsCards stats={mockStats} />);
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('renders summary count', () => {
    render(<AIStatsCards stats={mockStats} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('shows card titles', () => {
    render(<AIStatsCards stats={mockStats} />);
    expect(screen.getByText('Analises')).toBeInTheDocument();
    expect(screen.getByText('Score Medio')).toBeInTheDocument();
  });
});
