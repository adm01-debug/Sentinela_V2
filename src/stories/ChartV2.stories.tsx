import type { Meta, StoryObj } from '@storybook/react';

const ChartV2Component = () => <div>ChartV2 Component</div>;

const meta: Meta<typeof ChartV2Component> = {
  title: 'UI/ChartV2',
  component: ChartV2Component,
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
