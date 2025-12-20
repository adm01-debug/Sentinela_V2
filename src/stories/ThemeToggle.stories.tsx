import type { Meta, StoryObj } from '@storybook/react';
import { ThemeToggle } from '@/components/ui/themetoggle';

const meta: Meta<typeof ThemeToggle> = {
  title: 'UI/ThemeToggle',
  component: ThemeToggle,
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
