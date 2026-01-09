import type { Meta, StoryObj } from '@storybook/react';
import { StatCard } from './StatCard';

const meta: Meta<typeof StatCard> = {
  title: 'Components/StatCard',
  component: StatCard,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { title: 'Total Users', value: '1,234' } };
export const WithTrend: Story = { args: { title: 'Revenue', value: '$12,345', trend: { value: 12.5, direction: 'up' } } };
export const NegativeTrend: Story = { args: { title: 'Churn Rate', value: '2.4%', trend: { value: 0.3, direction: 'down' } } };
export const WithIcon: Story = { args: { title: 'Active Sessions', value: '892', icon: '👥' } };
export const Loading: Story = { args: { title: 'Loading', loading: true } };
export const WithChart: Story = { args: { title: 'Weekly', value: '5,678', sparkline: [10, 25, 15, 30, 20, 35, 40] } };
