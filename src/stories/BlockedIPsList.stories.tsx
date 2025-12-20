import type { Meta, StoryObj } from '@storybook/react';
import { BlockedIPsList } from '@/components/rate-limit/BlockedIPsList';

const meta: Meta<typeof BlockedIPsList> = {
  title: 'Components/RateLimit/BlockedIPsList',
  component: BlockedIPsList,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    blockedIPs: [
      { id: '1', ip_address: '192.168.1.100', reason: 'Rate limit exceeded', blocked_at: new Date().toISOString(), expires_at: null },
      { id: '2', ip_address: '10.0.0.50', reason: 'Brute force attempt', blocked_at: new Date().toISOString(), expires_at: null },
    ],
    onUnblock: () => {},
  },
};

export const ManyBlocked: Story = {
  args: {
    blockedIPs: [
      { id: '1', ip_address: '192.168.1.100', reason: 'Rate limit', blocked_at: new Date().toISOString(), expires_at: null },
      { id: '2', ip_address: '10.0.0.50', reason: 'Brute force', blocked_at: new Date().toISOString(), expires_at: null },
      { id: '3', ip_address: '172.16.0.1', reason: 'Spam', blocked_at: new Date().toISOString(), expires_at: null },
      { id: '4', ip_address: '8.8.8.8', reason: 'Suspicious', blocked_at: new Date().toISOString(), expires_at: null },
    ],
    onUnblock: () => {},
  },
};

export const Empty: Story = {
  args: {
    blockedIPs: [],
    onUnblock: () => {},
  },
};
