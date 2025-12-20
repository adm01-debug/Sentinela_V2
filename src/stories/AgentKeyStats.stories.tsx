import type { Meta, StoryObj } from '@storybook/react';
import { AgentKeyStats } from '@/components/agent-keys/AgentKeyStats';

const meta: Meta<typeof AgentKeyStats> = {
  title: 'Components/AgentKeys/AgentKeyStats',
  component: AgentKeyStats,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    total: 25,
    active: 20,
    expired: 5,
    recentlyUsed: 15,
  },
};

export const AllActive: Story = {
  args: {
    total: 10,
    active: 10,
    expired: 0,
    recentlyUsed: 10,
  },
};

export const ManyExpired: Story = {
  args: {
    total: 50,
    active: 20,
    expired: 30,
    recentlyUsed: 5,
  },
};
