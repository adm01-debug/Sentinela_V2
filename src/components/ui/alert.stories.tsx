import type { Meta, StoryObj } from '@storybook/react';
import { alert } from './alert';

const meta: Meta<typeof alert> = {
  title: 'UI/alert',
  component: alert,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof alert>;

export const Default: Story = {};
