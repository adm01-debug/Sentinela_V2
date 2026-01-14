import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ActivityHeatmap } from '../ActivityHeatmap';

describe('ActivityHeatmap', () => {
  const mockKeystrokes = [
    { recorded_at: '2026-01-01T10:00:00Z', employee_name: 'John' },
    { recorded_at: '2026-01-01T11:00:00Z', employee_name: 'Jane' },
  ];

  const mockClicks = [
    { recorded_at: '2026-01-01T10:00:00Z', employee_name: 'John' },
  ];

  it('renders heatmap', () => {
    render(<ActivityHeatmap keystrokes={mockKeystrokes} clicks={mockClicks} />);
    expect(screen.getByText(/Atividade/i)).toBeInTheDocument();
  });

  it('handles empty data', () => {
    render(<ActivityHeatmap keystrokes={[]} clicks={[]} />);
    expect(screen.getByText(/Atividade/i)).toBeInTheDocument();
  });

  it('shows top employees', () => {
    render(<ActivityHeatmap keystrokes={mockKeystrokes} clicks={mockClicks} />);
    expect(screen.getByText('John')).toBeInTheDocument();
  });
});
