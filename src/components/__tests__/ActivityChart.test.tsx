import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ActivityChart } from '../ActivityChart';

describe('ActivityChart', () => {
  const mockData = [
    { date: '2026-01-01', value: 100 },
    { date: '2026-01-02', value: 150 },
    { date: '2026-01-03', value: 120 },
  ];

  it('renders chart with default title', () => {
    render(<ActivityChart data={mockData} />);
    expect(screen.getByText('Activity')).toBeInTheDocument();
  });

  it('renders chart with custom title', () => {
    render(<ActivityChart data={mockData} title="Custom Title" />);
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });

  it('handles empty data gracefully', () => {
    render(<ActivityChart data={[]} />);
    // Component should still render with title
    expect(screen.getByText('Activity')).toBeInTheDocument();
  });

  it('renders card container', () => {
    const { container } = render(<ActivityChart data={mockData} />);
    expect(container.querySelector('.h-\\[300px\\]')).toBeInTheDocument();
  });
});
