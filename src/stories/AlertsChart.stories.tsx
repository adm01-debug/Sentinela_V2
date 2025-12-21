import type { Meta, StoryObj } from '@storybook/react';

import { AlertsChart } from '@/components/AlertsChart';

const meta: Meta<typeof AlertsChart> = {
  title: 'Components/AlertsChart',
  component: AlertsChart,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof AlertsChart>;

export const Default: Story = {
  args: {},
};

export const WithCustomClass: Story = {
  args: {
    className: 'custom-class',
  },
};
