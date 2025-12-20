import type { Meta, StoryObj } from '@storybook/react';
import { DeviceStats } from '@/components/devices/DeviceStats';

const meta: Meta<typeof DeviceStats> = {
  title: 'Components/Devices/DeviceStats',
  component: DeviceStats,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    total: 150,
    active: 142,
    desktop: 100,
    needsUpdate: 12,
  },
};

export const AllActive: Story = {
  args: {
    total: 50,
    active: 50,
    desktop: 35,
    needsUpdate: 0,
  },
};

export const ManyInactive: Story = {
  args: {
    total: 200,
    active: 80,
    desktop: 150,
    needsUpdate: 45,
  },
};
