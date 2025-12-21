import type { Meta, StoryObj } from '@storybook/react';

import { ActivityHeatmap } from '@/components/ActivityHeatmap';

const meta: Meta<typeof ActivityHeatmap> = {
  title: 'Components/ActivityHeatmap',
  component: ActivityHeatmap,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof ActivityHeatmap>;

export const Default: Story = {
  args: {},
};

export const WithCustomClass: Story = {
  args: {
    className: 'custom-class',
  },
};
