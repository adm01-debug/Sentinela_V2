import type { Meta, StoryObj } from '@storybook/react';
import { SecurityEventCard } from '@/components/security/SecurityEventCard';

const meta: Meta<typeof SecurityEventCard> = {
  title: 'Components/Security/SecurityEventCard',
  component: SecurityEventCard,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Critical: Story = {
  args: {
    event: {
      id: '1',
      type: 'brute_force',
      severity: 'critical',
      ip_address: '192.168.1.100',
      description: 'Tentativa de força bruta detectada - 50 logins falhos',
      created_at: new Date().toISOString(),
      resolved: false,
    },
    onResolve: () => {},
  },
};

export const High: Story = {
  args: {
    event: {
      id: '2',
      type: 'suspicious_activity',
      severity: 'high',
      ip_address: '10.0.0.50',
      description: 'Atividade suspeita detectada fora do horário',
      created_at: new Date().toISOString(),
      resolved: false,
    },
    onResolve: () => {},
  },
};

export const Resolved: Story = {
  args: {
    event: {
      id: '3',
      type: 'login_failed',
      severity: 'low',
      ip_address: '172.16.0.1',
      description: 'Login falhou 3 vezes',
      created_at: new Date().toISOString(),
      resolved: true,
    },
    onResolve: () => {},
  },
};
