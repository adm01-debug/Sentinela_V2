import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ActivityHeatmap } from '../ActivityHeatmap';

describe('ActivityHeatmap', () => {
  const mockData = {
    '2026-01-01': 5,
    '2026-01-02': 10,
    '2026-01-03': 3,
  };

  it('renders heatmap grid', () => {
    render(<ActivityHeatmap data={mockData} />);
    expect(screen.getByTestId('heatmap-grid')).toBeInTheDocument();
  });

  it('applies correct color intensity', () => {
    const { container } = render(<ActivityHeatmap data={mockData} />);
    const cells = container.querySelectorAll('.heatmap-cell');
    expect(cells.length).toBeGreaterThan(0);
  });

  it('shows tooltip on hover', async () => {
    render(<ActivityHeatmap data={mockData} showTooltip />);
    const cell = screen.getAllByTestId('heatmap-cell')[0];
    fireEvent.mouseEnter(cell);
    expect(await screen.findByRole('tooltip')).toBeInTheDocument();
  });

  it('handles empty data', () => {
    render(<ActivityHeatmap data={{}} />);
    expect(screen.getByText(/no data/i)).toBeInTheDocument();
  });

  it('renders legend', () => {
    render(<ActivityHeatmap data={mockData} showLegend />);
    expect(screen.getByTestId('heatmap-legend')).toBeInTheDocument();
  });
});
