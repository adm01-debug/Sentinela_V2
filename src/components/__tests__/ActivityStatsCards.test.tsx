import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ActivityStatsCards } from '../ActivityStatsCards';

describe('ActivityStatsCards', () => {
  // ActivityStatsCards expects props with activeEmployeesCount (not activeEmployees)
  const mockProps = {
    totalKeystrokes: 1500,
    totalClicks: 500,
    activeEmployeesCount: 45,
    keystrokesPerMinute: 25,
    clicksPerMinute: 10,
  };

  it('renders all stat cards', () => {
    render(<ActivityStatsCards {...mockProps} />);
    // totalKeystrokes is formatted as 1.500 in pt-BR
    expect(screen.getByText('1.500')).toBeInTheDocument();
  });

  it('displays active employees count', () => {
    render(<ActivityStatsCards {...mockProps} />);
    expect(screen.getByText('45')).toBeInTheDocument();
  });

  it('handles zero values', () => {
    render(
      <ActivityStatsCards
        totalKeystrokes={0}
        totalClicks={0}
        activeEmployeesCount={0}
        keystrokesPerMinute={0}
        clicksPerMinute={0}
      />
    );
    expect(screen.getAllByText('0').length).toBeGreaterThan(0);
  });

  it('shows activity per minute', () => {
    render(<ActivityStatsCards {...mockProps} />);
    // keystrokesPerMinute + clicksPerMinute = 35
    expect(screen.getByText('35')).toBeInTheDocument();
  });
});
