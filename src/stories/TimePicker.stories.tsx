import type { Meta, StoryObj } from '@storybook/react';
import { TimePicker } from '@/components/ui/timepicker';

const meta: Meta<typeof TimePicker> = {
  title: 'UI/TimePicker',
  component: TimePicker,
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
