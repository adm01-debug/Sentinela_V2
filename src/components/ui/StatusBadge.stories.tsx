import type { Meta, StoryObj } from '@storybook/react';
import { StatusBadge } from './StatusBadge';

const meta: Meta<typeof StatusBadge> = {
  title: 'UI/StatusBadge',
  component: StatusBadge,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof StatusBadge>;

export const Default: Story = {};
