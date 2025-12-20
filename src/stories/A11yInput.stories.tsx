import type { Meta, StoryObj } from '@storybook/react';

const A11yInputComponent = () => <div>A11yInput Component</div>;

const meta: Meta<typeof A11yInputComponent> = {
  title: 'UI/A11yInput',
  component: A11yInputComponent,
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
