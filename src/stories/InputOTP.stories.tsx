import type { Meta, StoryObj } from '@storybook/react';

const InputOTPComponent = () => <div>InputOTP Component</div>;

const meta: Meta<typeof InputOTPComponent> = {
  title: 'UI/InputOTP',
  component: InputOTPComponent,
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
