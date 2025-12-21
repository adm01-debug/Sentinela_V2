import type { Meta, StoryObj } from '@storybook/react';

import { ActivityStatsCards } from '@/components/ActivityStatsCards';

const meta: Meta<typeof ActivityStatsCards> = {
  title: 'Components/ActivityStatsCards',
  component: ActivityStatsCards,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof ActivityStatsCards>;

export const Default: Story = {
  args: {},
};

export const WithCustomClass: Story = {
  args: {
    className: 'custom-class',
  },
};
