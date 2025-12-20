import type { Meta, StoryObj } from '@storybook/react';
import { Toggle } from '@/components/ui/toggle';

const meta: Meta<typeof Toggle> = {
  title: 'UI/Toggle',
  component: Toggle,
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
