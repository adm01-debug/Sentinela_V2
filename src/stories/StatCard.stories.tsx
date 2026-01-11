import type { Meta, StoryObj } from '@storybook/react';
import { StatCard } from '../components/StatCard';

const meta: Meta<typeof StatCard> = { title: 'Components/StatCard', component: StatCard, tags: ['autodocs'] };

export default meta;
type Story = StoryObj<typeof StatCard>;

export const Default: Story = { args: { title: 'Total Users', value: 1234, icon: 'users' } };
export const WithTrend: Story = { args: { title: 'Revenue', value: '$12,345', trend: 15 } };
export const NegativeTrend: Story = { args: { title: 'Bounce Rate', value: '45%', trend: -8 } };