import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Users, AlertTriangle, TrendingUp } from 'lucide-react';
import { StatCard } from '../StatCard';

describe('StatCard', () => {
  describe('rendering', () => {
    it('should render title and value', () => {
      render(
        <StatCard
          title="Total Users"
          value={42}
          icon={Users}
        />
      );

      expect(screen.getByText('Total Users')).toBeInTheDocument();
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('should render description when provided', () => {
      render(
        <StatCard
          title="Active Users"
          value={100}
          icon={Users}
          description="Last 24 hours"
        />
      );

      expect(screen.getByText('Last 24 hours')).toBeInTheDocument();
    });

    it('should render string values correctly', () => {
      render(
        <StatCard
          title="Online"
          value="15/30"
          icon={Users}
        />
      );

      expect(screen.getByText('15/30')).toBeInTheDocument();
    });
  });

  describe('trend indicator', () => {
    it('should show positive trend with plus sign', () => {
      render(
        <StatCard
          title="Growth"
          value={500}
          icon={TrendingUp}
          trend={15}
        />
      );

      expect(screen.getByText('+15%')).toBeInTheDocument();
    });

    it('should show negative trend without plus sign', () => {
      render(
        <StatCard
          title="Decline"
          value={200}
          icon={AlertTriangle}
          trend={-10}
        />
      );

      expect(screen.getByText('-10%')).toBeInTheDocument();
    });

    it('should show zero trend', () => {
      render(
        <StatCard
          title="Stable"
          value={100}
          icon={Users}
          trend={0}
        />
      );

      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('should show trend label when provided', () => {
      render(
        <StatCard
          title="Sales"
          value={1000}
          icon={TrendingUp}
          trend={25}
          trendLabel="vs last month"
        />
      );

      expect(screen.getByText('vs last month')).toBeInTheDocument();
    });
  });

  describe('color variants', () => {
    it('should apply default color', () => {
      const { container } = render(
        <StatCard
          title="Default"
          value={50}
          icon={Users}
          color="default"
        />
      );

      expect(container.querySelector('.text-primary')).toBeInTheDocument();
    });

    it('should apply success color', () => {
      const { container } = render(
        <StatCard
          title="Success"
          value={100}
          icon={Users}
          color="success"
        />
      );

      expect(container.querySelector('.text-green-500')).toBeInTheDocument();
    });

    it('should apply destructive color', () => {
      const { container } = render(
        <StatCard
          title="Alert"
          value={5}
          icon={AlertTriangle}
          color="destructive"
        />
      );

      expect(container.querySelector('.text-red-500')).toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('should show skeleton when loading', () => {
      const { container } = render(
        <StatCard
          title="Loading"
          value={0}
          icon={Users}
          loading={true}
        />
      );

      expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
      expect(screen.queryByText('Loading')).not.toBeInTheDocument();
    });

    it('should not show skeleton when not loading', () => {
      const { container } = render(
        <StatCard
          title="Loaded"
          value={100}
          icon={Users}
          loading={false}
        />
      );

      expect(container.querySelector('.animate-pulse')).not.toBeInTheDocument();
      expect(screen.getByText('Loaded')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have correct ARIA role', () => {
      render(
        <StatCard
          title="Accessible Card"
          value={42}
          icon={Users}
        />
      );

      expect(screen.getByRole('region')).toBeInTheDocument();
    });

    it('should have aria-labelledby pointing to title', () => {
      render(
        <StatCard
          title="My Metric"
          value={100}
          icon={Users}
        />
      );

      const region = screen.getByRole('region');
      expect(region).toHaveAttribute('aria-labelledby', 'stat-my-metric');
    });

    it('should have hidden icon for screen readers', () => {
      const { container } = render(
        <StatCard
          title="Test"
          value={1}
          icon={Users}
        />
      );

      // Icon should have aria-hidden
      const iconContainer = container.querySelector('[aria-hidden="true"]');
      expect(iconContainer).toBeInTheDocument();
    });
  });

  describe('custom className', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <StatCard
          title="Custom"
          value={50}
          icon={Users}
          className="my-custom-class"
        />
      );

      expect(container.firstChild).toHaveClass('my-custom-class');
    });
  });
});
