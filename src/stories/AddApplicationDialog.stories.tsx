import type { Meta, StoryObj } from '@storybook/react';

import { AddApplicationDialog } from '@/components/AddApplicationDialog';

const meta: Meta<typeof AddApplicationDialog> = {
  title: 'Components/AddApplicationDialog',
  component: AddApplicationDialog,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof AddApplicationDialog>;

export const Default: Story = {
  args: {},
};

export const WithCustomClass: Story = {
  args: {
    className: 'custom-class',
  },
};
