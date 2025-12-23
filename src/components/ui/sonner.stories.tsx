import type { Meta, StoryObj } from '@storybook/react';
import { sonner } from './sonner';

const meta: Meta<typeof sonner> = {
  title: 'UI/sonner',
  component: sonner,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof sonner>;

export const Default: Story = {};
