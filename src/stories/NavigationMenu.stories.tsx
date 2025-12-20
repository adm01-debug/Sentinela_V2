import type { Meta, StoryObj } from '@storybook/react';

const NavigationMenuComponent = () => <div>NavigationMenu Component</div>;

const meta: Meta<typeof NavigationMenuComponent> = {
  title: 'UI/NavigationMenu',
  component: NavigationMenuComponent,
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
