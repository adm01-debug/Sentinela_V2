import type { Meta, StoryObj } from '@storybook/react';

const DropdownMenuComponent = () => <div>DropdownMenu Component</div>;

const meta: Meta<typeof DropdownMenuComponent> = {
  title: 'UI/DropdownMenu',
  component: DropdownMenuComponent,
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
