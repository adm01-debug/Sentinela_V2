import type { Meta, StoryObj } from '@storybook/react';
import { Separator } from '@/components/ui/separator';

const meta: Meta<typeof Separator> = {
  title: 'UI/Separator',
  component: Separator,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: () => (
    <div>
      <p>Content above</p>
      <Separator className="my-4" />
      <p>Content below</p>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="flex h-5 items-center space-x-4 text-sm">
      <span>Item 1</span>
      <Separator orientation="vertical" />
      <span>Item 2</span>
      <Separator orientation="vertical" />
      <span>Item 3</span>
    </div>
  ),
};
