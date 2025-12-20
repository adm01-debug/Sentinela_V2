import type { Meta, StoryObj } from '@storybook/react';
import { UserStats } from '@/components/users/UserStats';

const meta: Meta<typeof UserStats> = {
  title: 'Components/Users/UserStats',
  component: UserStats,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    total: 50,
    active: 45,
    admins: 3,
    withMFA: 20,
  },
};

export const SmallTeam: Story = {
  args: {
    total: 5,
    active: 5,
    admins: 1,
    withMFA: 5,
  },
};

export const LargeOrg: Story = {
  args: {
    total: 500,
    active: 480,
    admins: 10,
    withMFA: 150,
  },
};
