import type { Meta, StoryObj } from '@storybook/react';
import { DeviceCard } from '@/components/devices/DeviceCard';

const meta: Meta<typeof DeviceCard> = {
  title: 'Components/Devices/DeviceCard',
  component: DeviceCard,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Desktop: Story = {
  args: {
    device: {
      id: '1',
      name: 'Workstation-001',
      type: 'desktop',
      os: 'Windows 11',
      is_active: true,
      last_seen: new Date().toISOString(),
      employee: { name: 'João Silva' },
    },
    onViewDetails: () => {},
    onDeactivate: () => {},
    onReactivate: () => {},
    onDelete: () => {},
  },
};

export const Mobile: Story = {
  args: {
    device: {
      id: '2',
      name: 'iPhone-Maria',
      type: 'mobile',
      os: 'iOS 17',
      is_active: true,
      last_seen: new Date().toISOString(),
      employee: { name: 'Maria Santos' },
    },
    onViewDetails: () => {},
    onDeactivate: () => {},
    onReactivate: () => {},
    onDelete: () => {},
  },
};

export const Inactive: Story = {
  args: {
    device: {
      id: '3',
      name: 'Old-Laptop',
      type: 'desktop',
      os: 'Windows 10',
      is_active: false,
      last_seen: '2024-01-01T00:00:00Z',
      employee: { name: 'Carlos Lima' },
    },
    onViewDetails: () => {},
    onDeactivate: () => {},
    onReactivate: () => {},
    onDelete: () => {},
  },
};
