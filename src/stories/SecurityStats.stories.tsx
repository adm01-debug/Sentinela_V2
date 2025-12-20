import type { Meta, StoryObj } from '@storybook/react';
import { SecurityStats } from '@/components/security/SecurityStats';

const meta: Meta<typeof SecurityStats> = {
  title: 'Components/Security/SecurityStats',
  component: SecurityStats,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    total: 125,
    critical: 5,
    unresolved: 15,
    today: 8,
  },
};

export const NoCritical: Story = {
  args: {
    total: 50,
    critical: 0,
    unresolved: 5,
    today: 2,
  },
};

export const HighAlert: Story = {
  args: {
    total: 500,
    critical: 50,
    unresolved: 100,
    today: 75,
  },
};
