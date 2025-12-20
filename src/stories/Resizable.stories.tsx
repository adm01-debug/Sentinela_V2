import type { Meta, StoryObj } from '@storybook/react';
import { Resizable } from '@/components/ui/resizable';

const meta: Meta<typeof Resizable> = {
  title: 'UI/Resizable',
  component: Resizable,
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
