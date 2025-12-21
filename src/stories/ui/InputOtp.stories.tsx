import type { Meta, StoryObj } from '@storybook/react';
import { InputOtp } from '@/components/ui/input-otp';

const meta: Meta<typeof InputOtp> = {
  title: 'UI/InputOtp',
  component: InputOtp,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    className: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithCustomClass: Story = {
  args: {
    className: 'custom-class',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const Interactive: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    // Interactive test
  },
};
