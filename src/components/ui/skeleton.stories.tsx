import type { Meta, StoryObj } from '@storybook/react';
import { skeleton } from './skeleton';

const meta: Meta<typeof skeleton> = {
  title: 'UI/skeleton',
  component: skeleton,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof skeleton>;

export const Default: Story = {};
