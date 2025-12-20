import type { Meta, StoryObj } from '@storybook/react';

const ScrollAreaComponent = () => <div>ScrollArea Component</div>;

const meta: Meta<typeof ScrollAreaComponent> = {
  title: 'UI/ScrollArea',
  component: ScrollAreaComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Variants: Story = {
  args: {},
};

export const Interactive: Story = {
  args: {},
};
