import type { Meta, StoryObj } from '@storybook/react';
import { RateLimitRealtimeAlerts } from '@/components/RateLimitRealtimeAlerts';

const meta: Meta<typeof RateLimitRealtimeAlerts> = {
  title: 'Components/RateLimitRealtimeAlerts',
  component: RateLimitRealtimeAlerts,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof RateLimitRealtimeAlerts>;

export const Default: Story = { args: {} };
export const WithCustomClass: Story = { args: { className: 'custom-class' } };
