import type { Meta, StoryObj } from '@storybook/react';
import { DashboardStats } from '@/components/dashboard/DashboardStats';

const meta: Meta<typeof DashboardStats> = {
  title: 'Components/Dashboard/DashboardStats',
  component: DashboardStats,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    employees: 150,
    violations: 23,
    activeDevices: 142,
    productivity: 87,
  },
};

export const HighProductivity: Story = {
  args: {
    employees: 50,
    violations: 2,
    activeDevices: 48,
    productivity: 95,
  },
};

export const LowProductivity: Story = {
  args: {
    employees: 200,
    violations: 85,
    activeDevices: 180,
    productivity: 65,
  },
};
