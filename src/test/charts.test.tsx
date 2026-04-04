import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BaseLineChart } from '@/components/charts/BaseLineChart';
import { BaseAreaChart } from '@/components/charts/BaseAreaChart';
import { BaseBarChart } from '@/components/charts/BaseBarChart';
import { BaseDonutChart } from '@/components/charts/BaseDonutChart';
import { Sparkline } from '@/components/charts/Sparkline';
import { ChartEmptyState } from '@/components/charts/ChartEmptyState';

// Mock recharts ResponsiveContainer for test env
vi.mock('recharts', async () => {
  const actual = await vi.importActual('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="responsive-container">{children}</div>
    ),
  };
});

describe('Chart Library', () => {
  describe('ChartEmptyState', () => {
    it('renders default empty state', () => {
      render(<ChartEmptyState />);
      expect(screen.getByText('Sem dados disponíveis')).toBeInTheDocument();
    });

    it('renders custom messages', () => {
      render(<ChartEmptyState title="Custom Title" description="Custom Desc" />);
      expect(screen.getByText('Custom Title')).toBeInTheDocument();
      expect(screen.getByText('Custom Desc')).toBeInTheDocument();
    });
  });

  describe('BaseLineChart', () => {
    it('shows empty state when no data', () => {
      render(<BaseLineChart data={[]} series={[{ dataKey: 'value', label: 'Value' }]} emptyTitle="No data" />);
      expect(screen.getByText('No data')).toBeInTheDocument();
    });

    it('renders chart with data', () => {
      const data = [{ date: 'Mon', value: 10 }, { date: 'Tue', value: 20 }];
      const { container } = render(
        <BaseLineChart data={data} series={[{ dataKey: 'value', label: 'Value' }]} />
      );
      expect(container.querySelector('[data-testid="responsive-container"]')).toBeInTheDocument();
    });
  });

  describe('BaseAreaChart', () => {
    it('shows empty state when no data', () => {
      render(<BaseAreaChart data={[]} series={[{ dataKey: 'value', label: 'Value' }]} emptyTitle="Empty" />);
      expect(screen.getByText('Empty')).toBeInTheDocument();
    });

    it('renders chart with data', () => {
      const data = [{ date: 'Mon', value: 10 }];
      const { container } = render(
        <BaseAreaChart data={data} series={[{ dataKey: 'value', label: 'Value' }]} />
      );
      expect(container.querySelector('[data-testid="responsive-container"]')).toBeInTheDocument();
    });
  });

  describe('BaseBarChart', () => {
    it('shows empty state when no data', () => {
      render(<BaseBarChart data={[]} series={[{ dataKey: 'count', label: 'Count' }]} emptyTitle="No bars" />);
      expect(screen.getByText('No bars')).toBeInTheDocument();
    });

    it('renders with data', () => {
      const data = [{ name: 'A', count: 5 }, { name: 'B', count: 10 }];
      const { container } = render(
        <BaseBarChart data={data} series={[{ dataKey: 'count', label: 'Count' }]} />
      );
      expect(container.querySelector('[data-testid="responsive-container"]')).toBeInTheDocument();
    });
  });

  describe('BaseDonutChart', () => {
    it('shows empty state when no data', () => {
      render(<BaseDonutChart data={[]} emptyTitle="No donut" />);
      expect(screen.getByText('No donut')).toBeInTheDocument();
    });

    it('renders with data', () => {
      const data = [{ name: 'A', value: 30 }, { name: 'B', value: 70 }];
      const { container } = render(<BaseDonutChart data={data} />);
      expect(container.querySelector('[data-testid="responsive-container"]')).toBeInTheDocument();
    });
  });

  describe('Sparkline', () => {
    it('renders sparkline', () => {
      const { container } = render(<Sparkline data={[1, 5, 3, 8, 2]} />);
      expect(container.querySelector('[data-testid="responsive-container"]')).toBeInTheDocument();
    });
  });
});
