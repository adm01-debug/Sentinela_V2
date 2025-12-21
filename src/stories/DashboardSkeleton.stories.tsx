import type { Meta, StoryObj } from '@storybook/react';

import { DashboardSkeleton } from '@/components/DashboardSkeleton';

const meta: Meta<typeof DashboardSkeleton> = {
  title: 'Components/DashboardSkeleton',
  component: DashboardSkeleton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof DashboardSkeleton>;

export const Default: Story = {
  args: {},
};

export const WithCustomClass: Story = {
  args: {
    className: 'custom-class',
  },
};
