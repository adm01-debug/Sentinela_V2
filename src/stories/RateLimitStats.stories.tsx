import type { Meta, StoryObj } from '@storybook/react';
import { RateLimitStats } from '@/components/rate-limit/RateLimitStats';

const meta: Meta<typeof RateLimitStats> = {
  title: 'Components/RateLimit/RateLimitStats',
  component: RateLimitStats,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    totalRequests: 15420,
    blockedRequests: 234,
    blockedPercentage: 1.52,
    uniqueIPs: 89,
  },
};

export const HighBlocked: Story = {
  args: {
    totalRequests: 50000,
    blockedRequests: 5000,
    blockedPercentage: 10,
    uniqueIPs: 150,
  },
};

export const NoBlocked: Story = {
  args: {
    totalRequests: 1000,
    blockedRequests: 0,
    blockedPercentage: 0,
    uniqueIPs: 25,
  },
};
