import type { Meta, StoryObj } from '@storybook/react';
import { Sonner } from '@/components/ui/sonner';

const meta: Meta<typeof Sonner> = {
  title: 'UI/Sonner',
  component: Sonner,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithVariants: Story = {
  args: {},
};
