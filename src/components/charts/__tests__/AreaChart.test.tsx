import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BaseAreaChart } from '../BaseAreaChart';
import { ThemeProvider } from '@/providers/ThemeProvider';

vi.mock('recharts', async () => {
  const actual = await vi.importActual('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  };
});

describe('BaseAreaChart', () => {
  const mockData = [
    { date: '2023-01-01', value: 100 },
    { date: '2023-01-02', value: 200 },
  ];
  const mockSeries = [{ dataKey: 'value', label: 'Value' }];

  it('renders correctly with data', () => {
    render(
      <ThemeProvider>
        <BaseAreaChart data={mockData} series={mockSeries} />
      </ThemeProvider>
    );
    
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('renders empty state when data is empty', () => {
    render(
      <ThemeProvider>
        <BaseAreaChart data={[]} series={mockSeries} emptyTitle="No data available" />
      </ThemeProvider>
    );
    
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });
});
