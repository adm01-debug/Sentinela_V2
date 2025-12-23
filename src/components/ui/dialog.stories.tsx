import type { Meta, StoryObj } from '@storybook/react';
import { dialog } from './dialog';

const meta: Meta<typeof dialog> = {
  title: 'UI/dialog',
  component: dialog,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof dialog>;

export const Default: Story = {};
