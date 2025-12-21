import type { Meta, StoryObj } from '@storybook/react';

import { DashboardCustomizer } from '@/components/DashboardCustomizer';

const meta: Meta<typeof DashboardCustomizer> = {
  title: 'Components/DashboardCustomizer',
  component: DashboardCustomizer,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof DashboardCustomizer>;

export const Default: Story = {
  args: {},
};

export const WithCustomClass: Story = {
  args: {
    className: 'custom-class',
  },
};
