import type { Meta, StoryObj } from '@storybook/react';

import { ActivityChart } from '@/components/ActivityChart';

const meta: Meta<typeof ActivityChart> = {
  title: 'Components/ActivityChart',
  component: ActivityChart,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof ActivityChart>;

export const Default: Story = {
  args: {},
};

export const WithCustomClass: Story = {
  args: {
    className: 'custom-class',
  },
};
