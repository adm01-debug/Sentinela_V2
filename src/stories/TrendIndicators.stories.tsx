import type { Meta, StoryObj } from '@storybook/react';
import { TrendIndicator } from '../components/ui/TrendIndicators';

const meta: Meta<typeof TrendIndicator> = {
  title: 'UI/TrendIndicator',
  component: TrendIndicator,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof TrendIndicator>;

export const PositiveTrend: Story = {
  args: { value: 12.5, direction: 'up' },
};

export const NegativeTrend: Story = {
  args: { value: -8.3, direction: 'down' },
};

export const NeutralTrend: Story = {
  args: { value: 0, direction: 'neutral' },
};

export const WithLabel: Story = {
  args: { value: 15.2, direction: 'up', label: 'vs last month' },
};

export const SmallSize: Story = {
  args: { value: 5.5, direction: 'up', size: 'sm' },
};

export const LargeSize: Story = {
  args: { value: 25.0, direction: 'up', size: 'lg' },
};

export const InvertedColors: Story = {
  args: { value: -10, direction: 'down', invertColors: true },
};
