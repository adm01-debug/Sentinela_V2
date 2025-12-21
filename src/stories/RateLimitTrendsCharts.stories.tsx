import type { Meta, StoryObj } from '@storybook/react';
import { RateLimitTrendsCharts } from '@/components/RateLimitTrendsCharts';

const meta: Meta<typeof RateLimitTrendsCharts> = {
  title: 'Components/RateLimitTrendsCharts',
  component: RateLimitTrendsCharts,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof RateLimitTrendsCharts>;

export const Default: Story = { args: {} };
export const WithCustomClass: Story = { args: { className: 'custom-class' } };
