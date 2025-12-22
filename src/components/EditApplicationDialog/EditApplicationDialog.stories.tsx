import type { Meta, StoryObj } from '@storybook/react';
import { EditApplicationDialog } from './EditApplicationDialog';

const meta: Meta<typeof EditApplicationDialog> = {
  title: 'Components/EditApplicationDialog',
  component: EditApplicationDialog,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof EditApplicationDialog>;

export const Default: Story = {};
