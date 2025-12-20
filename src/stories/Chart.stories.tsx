import type { Meta, StoryObj } from '@storybook/react';

const ChartComponent = () => <div>Chart Component</div>;

const meta: Meta<typeof ChartComponent> = {
  title: 'UI/Chart',
  component: ChartComponent,
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
