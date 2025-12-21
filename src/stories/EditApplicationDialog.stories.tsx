import type { Meta, StoryObj } from '@storybook/react';

import { EditApplicationDialog } from '@/components/EditApplicationDialog';

const meta: Meta<typeof EditApplicationDialog> = {
  title: 'Components/EditApplicationDialog',
  component: EditApplicationDialog,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof EditApplicationDialog>;

export const Default: Story = {
  args: {},
};

export const WithCustomClass: Story = {
  args: {
    className: 'custom-class',
  },
};
