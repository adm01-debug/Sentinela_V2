import type { Meta, StoryObj } from '@storybook/react';
import { InputOTP } from '@/components/ui/inputotp';

const meta: Meta<typeof InputOTP> = {
  title: 'UI/InputOTP',
  component: InputOTP,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithVariants: Story = {
  args: {},
};
