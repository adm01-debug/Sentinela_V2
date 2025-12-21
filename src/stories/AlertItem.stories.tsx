import type { Meta, StoryObj } from '@storybook/react';

import { AlertItem } from '@/components/AlertItem';

const meta: Meta<typeof AlertItem> = {
  title: 'Components/AlertItem',
  component: AlertItem,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof AlertItem>;

export const Default: Story = {
  args: {},
};

export const WithCustomClass: Story = {
  args: {
    className: 'custom-class',
  },
};
