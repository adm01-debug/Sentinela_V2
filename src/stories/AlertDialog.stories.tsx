import type { Meta, StoryObj } from '@storybook/react';
import { AlertDialog } from '@/components/ui/alertdialog';

const meta: Meta<typeof AlertDialog> = {
  title: 'UI/AlertDialog',
  component: AlertDialog,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithProps: Story = {
  args: {},
};
