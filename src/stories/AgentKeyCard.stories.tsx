import type { Meta, StoryObj } from '@storybook/react';
import { AgentKeyCard } from '@/components/agent-keys/AgentKeyCard';

const meta: Meta<typeof AgentKeyCard> = {
  title: 'Components/AgentKeys/AgentKeyCard',
  component: AgentKeyCard,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Active: Story = {
  args: {
    agentKey: {
      id: '1',
      name: 'Production Key',
      key: 'sk_live_abc123...',
      is_active: true,
      expires_at: '2025-12-31T23:59:59Z',
      last_used_at: new Date().toISOString(),
      created_at: '2024-01-01T00:00:00Z',
    },
    onCopy: () => {},
    onRevoke: () => {},
    onReactivate: () => {},
    onDelete: () => {},
  },
};

export const Expired: Story = {
  args: {
    agentKey: {
      id: '2',
      name: 'Old Key',
      key: 'sk_live_xyz789...',
      is_active: false,
      expires_at: '2024-01-01T00:00:00Z',
      last_used_at: '2024-01-01T00:00:00Z',
      created_at: '2023-01-01T00:00:00Z',
    },
    onCopy: () => {},
    onRevoke: () => {},
    onReactivate: () => {},
    onDelete: () => {},
  },
};

export const NeverUsed: Story = {
  args: {
    agentKey: {
      id: '3',
      name: 'New Key',
      key: 'sk_live_new456...',
      is_active: true,
      expires_at: '2026-12-31T23:59:59Z',
      last_used_at: null,
      created_at: new Date().toISOString(),
    },
    onCopy: () => {},
    onRevoke: () => {},
    onReactivate: () => {},
    onDelete: () => {},
  },
};
