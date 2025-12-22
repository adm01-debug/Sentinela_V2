import type { Meta, StoryObj } from '@storybook/react';
import { AddApplicationDialog } from './AddApplicationDialog';

const meta: Meta<typeof AddApplicationDialog> = {
  title: 'Components/AddApplicationDialog',
  component: AddApplicationDialog,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AddApplicationDialog>;

export const Default: Story = {};
