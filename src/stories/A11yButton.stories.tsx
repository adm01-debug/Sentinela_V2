import type { Meta, StoryObj } from '@storybook/react';

const A11yButtonComponent = () => <div>A11yButton Component</div>;

const meta: Meta<typeof A11yButtonComponent> = {
  title: 'UI/A11yButton',
  component: A11yButtonComponent,
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
