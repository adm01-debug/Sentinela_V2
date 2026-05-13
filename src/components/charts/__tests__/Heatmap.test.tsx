import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BaseHeatmap } from '../BaseHeatmap';
import { ThemeProvider } from '@/providers/ThemeProvider';

vi.mock('recharts', async () => {
  const actual = await vi.importActual('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  };
});

describe('BaseHeatmap', () => {
  const mockData = [
    { x: 'Mon', y: '10am', value: 10 },
    { x: 'Mon', y: '11am', value: 20 },
    { x: 'Tue', y: '10am', value: 15 },
  ];

  it('renders correctly with data', () => {
    render(
      <ThemeProvider>
        <BaseHeatmap data={mockData} />
      </ThemeProvider>
    );
    
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('renders empty state when data is empty', () => {
    render(
      <ThemeProvider>
        <BaseHeatmap data={[]} emptyTitle="No data available" />
      </ThemeProvider>
    );
    
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });
});
