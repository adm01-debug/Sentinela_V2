import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BaseDonutChart } from '@/components/charts/BaseDonutChart';

vi.mock('recharts', () => ({
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ children, data, label }: any) => (
    <div data-testid="pie" data-has-label={!!label}>
      {children}
      {data?.map((_: any, i: number) => <div key={i} data-testid={`pie-entry-${i}`} />)}
    </div>
  ),
  Cell: ({ fill }: any) => <div data-testid="cell" data-fill={fill} />,
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive">{children}</div>,
  Tooltip: () => <div data-testid="tooltip" />,
}));

vi.mock('@/hooks/useChartColors', () => ({
  useChartColors: () => ({ primary: '#000' }),
}));

vi.mock('./ChartEmptyState', () => ({
  ChartEmptyState: ({ title }: any) => <div data-testid="empty">{title}</div>,
}));

describe('BaseDonutChart', () => {
  const sampleData = [
    { name: 'A', value: 30 },
    { name: 'B', value: 50 },
    { name: 'C', value: 20 },
  ];

  it('renders chart with data', () => {
    render(<BaseDonutChart data={sampleData} />);
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('renders correct number of data entries', () => {
    render(<BaseDonutChart data={sampleData} />);
    expect(screen.getByTestId('pie-entry-0')).toBeInTheDocument();
    expect(screen.getByTestId('pie-entry-1')).toBeInTheDocument();
    expect(screen.getByTestId('pie-entry-2')).toBeInTheDocument();
  });

  it('renders empty state when no data', () => {
    render(<BaseDonutChart data={[]} />);
    expect(screen.queryByTestId('pie-chart')).not.toBeInTheDocument();
  });

  it('renders with custom colors', () => {
    const colors = ['red', 'green', 'blue'];
    render(<BaseDonutChart data={sampleData} colors={colors} />);
    const cells = screen.getAllByTestId('cell');
    expect(cells[0]).toHaveAttribute('data-fill', 'red');
    expect(cells[1]).toHaveAttribute('data-fill', 'green');
    expect(cells[2]).toHaveAttribute('data-fill', 'blue');
  });

  it('renders tooltip', () => {
    render(<BaseDonutChart data={sampleData} />);
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
  });

  it('accepts custom height', () => {
    render(<BaseDonutChart data={sampleData} height={300} />);
    expect(screen.getByTestId('responsive')).toBeInTheDocument();
  });
});
