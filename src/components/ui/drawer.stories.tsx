import type { Meta, StoryObj } from '@storybook/react';
import { drawer } from './drawer';

const meta: Meta<typeof drawer> = {
  title: 'UI/drawer',
  component: drawer,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof drawer>;

export const Default: Story = {};
