import type { Meta, StoryObj } from '@storybook/react';

const AspectRatioV2Component = () => <div>AspectRatioV2 Component</div>;

const meta: Meta<typeof AspectRatioV2Component> = {
  title: 'UI/AspectRatioV2',
  component: AspectRatioV2Component,
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
