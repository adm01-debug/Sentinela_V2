import type { Meta, StoryObj } from '@storybook/react';

const RadioGroupComponent = () => <div>RadioGroup Component</div>;

const meta: Meta<typeof RadioGroupComponent> = {
  title: 'UI/RadioGroup',
  component: RadioGroupComponent,
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
