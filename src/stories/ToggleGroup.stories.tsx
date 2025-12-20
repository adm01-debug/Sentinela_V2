import type { Meta, StoryObj } from '@storybook/react';

const ToggleGroupComponent = () => <div>ToggleGroup Component</div>;

const meta: Meta<typeof ToggleGroupComponent> = {
  title: 'UI/ToggleGroup',
  component: ToggleGroupComponent,
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
