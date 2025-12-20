import type { Meta, StoryObj } from '@storybook/react';

const SidebarMenuComponent = () => <div>SidebarMenu Component</div>;

const meta: Meta<typeof SidebarMenuComponent> = {
  title: 'UI/SidebarMenu',
  component: SidebarMenuComponent,
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
