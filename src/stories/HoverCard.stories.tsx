import type { Meta, StoryObj } from '@storybook/react';

const HoverCardComponent = () => <div>HoverCard Component</div>;

const meta: Meta<typeof HoverCardComponent> = {
  title: 'UI/HoverCard',
  component: HoverCardComponent,
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
