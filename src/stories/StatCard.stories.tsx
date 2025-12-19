import type { Meta, StoryObj } from '@storybook/react';
import { StatCard, StatCardsGrid, CountStatCard, PercentStatCard, CurrencyStatCard } from '@/components/StatCard';
import { Users, TrendingUp, AlertTriangle, Clock } from 'lucide-react';

const meta: Meta<typeof StatCard> = {
  title: 'Components/StatCard',
  component: StatCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic
export const Default: Story = {
  args: {
    title: 'Total Revenue',
    value: 'R$ 45.231,89',
    description: '+20.1% from last month',
  },
};

// Com ícone
export const WithIcon: Story = {
  args: {
    title: 'Total Users',
    value: '2,350',
    description: '+180 this month',
    icon: <Users className="h-4 w-4" />,
  },
};

// Com tendência positiva
export const WithPositiveTrend: Story = {
  args: {
    title: 'Active Users',
    value: '1,234',
    trend: { value: 12.5, label: 'from last week' },
    icon: <TrendingUp className="h-4 w-4" />,
  },
};

// Com tendência negativa
export const WithNegativeTrend: Story = {
  args: {
    title: 'Violations',
    value: '23',
    trend: { value: -8.2, label: 'from last week' },
    icon: <AlertTriangle className="h-4 w-4" />,
  },
};

// Loading
export const Loading: Story = {
  args: {
    title: 'Loading...',
    value: '0',
    isLoading: true,
  },
};

// Grid de cards
export const CardsGrid: Story = {
  render: () => (
    <StatCardsGrid columns={4}>
      <StatCard
        title="Total Employees"
        value="156"
        icon={<Users className="h-4 w-4" />}
        trend={{ value: 5.2 }}
      />
      <StatCard
        title="Active Now"
        value="89"
        icon={<Clock className="h-4 w-4" />}
        description="57% online"
      />
      <StatCard
        title="Violations Today"
        value="12"
        icon={<AlertTriangle className="h-4 w-4" />}
        trend={{ value: -15 }}
      />
      <StatCard
        title="Productivity"
        value="78%"
        icon={<TrendingUp className="h-4 w-4" />}
        trend={{ value: 3.2 }}
      />
    </StatCardsGrid>
  ),
};

// Specialized cards
export const CountCard: Story = {
  render: () => (
    <CountStatCard
      title="Total Employees"
      count={156}
      previousCount={148}
      icon={<Users className="h-4 w-4" />}
    />
  ),
};

export const PercentCard: Story = {
  render: () => (
    <PercentStatCard
      title="Productivity Score"
      value={78.5}
      description="Team average"
      icon={<TrendingUp className="h-4 w-4" />}
    />
  ),
};

export const CurrencyCard: Story = {
  render: () => (
    <CurrencyStatCard
      title="Monthly Cost"
      value={45231.89}
      previousValue={42150.00}
    />
  ),
};
