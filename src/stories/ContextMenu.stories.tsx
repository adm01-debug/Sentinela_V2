import type { Meta, StoryObj } from '@storybook/react';

const ContextMenuComponent = () => <div>ContextMenu Component</div>;

const meta: Meta<typeof ContextMenuComponent> = {
  title: 'UI/ContextMenu',
  component: ContextMenuComponent,
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
