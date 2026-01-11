import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ActivityChart } from '../ActivityChart';

describe('ActivityChart', () => {
  const mockData = [
    { date: '2026-01-01', value: 100 },
    { date: '2026-01-02', value: 150 },
    { date: '2026-01-03', value: 120 },
  ];

  it('renders without crashing', () => {
    render(<ActivityChart data={mockData} />);
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('displays correct data points', () => {
    render(<ActivityChart data={mockData} />);
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('handles empty data gracefully', () => {
    render(<ActivityChart data={[]} />);
    expect(screen.getByText(/no data/i)).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<ActivityChart data={mockData} className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders loading state', () => {
    render(<ActivityChart data={mockData} loading />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('handles onClick events', () => {
    const handleClick = vi.fn();
    render(<ActivityChart data={mockData} onClick={handleClick} />);
    screen.getByRole('img').click();
    expect(handleClick).toHaveBeenCalled();
  });
});
