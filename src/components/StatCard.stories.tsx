import type { Meta, StoryObj } from '@storybook/react';
import { StatCard } from './StatCard';
import { Users, TrendingUp, AlertTriangle, Clock, DollarSign, ShoppingCart } from 'lucide-react';

// ============================================================
// META
// ============================================================

const meta: Meta<typeof StatCard> = {
  title: 'Components/StatCard',
  component: StatCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Statistics card for displaying key metrics with icons and trends.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: 'select',
      options: ['default', 'success', 'warning', 'danger'],
      description: 'Color theme of the card',
    },
    loading: {
      control: 'boolean',
      description: 'Show loading skeleton',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[300px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================
// BASIC STORIES
// ============================================================

export const Default: Story = {
  args: {
    title: 'Total Users',
    value: 1234,
    icon: Users,
    description: 'Active users this month',
  },
};

export const WithTrend: Story = {
  args: {
    title: 'Revenue',
    value: '$45,231',
    icon: DollarSign,
    description: '+20.1% from last month',
    color: 'success',
  },
};

export const Warning: Story = {
  args: {
    title: 'Pending Tasks',
    value: 23,
    icon: Clock,
    description: '5 overdue',
    color: 'warning',
  },
};

export const Danger: Story = {
  args: {
    title: 'Critical Alerts',
    value: 7,
    icon: AlertTriangle,
    description: 'Requires immediate attention',
    color: 'danger',
  },
};

export const Loading: Story = {
  args: {
    title: 'Loading...',
    value: 0,
    icon: Users,
    loading: true,
  },
};

// ============================================================
// GRID EXAMPLE
// ============================================================

export const DashboardGrid: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 w-[640px]">
      <StatCard
        title="Total Employees"
        value={156}
        icon={Users}
        description="12 new this month"
        color="default"
      />
      <StatCard
        title="Productivity"
        value="94%"
        icon={TrendingUp}
        description="+5% from last week"
        color="success"
      />
      <StatCard
        title="Pending Reviews"
        value={8}
        icon={Clock}
        description="3 urgent"
        color="warning"
      />
      <StatCard
        title="Violations"
        value={3}
        icon={AlertTriangle}
        description="2 critical"
        color="danger"
      />
    </div>
  ),
};
