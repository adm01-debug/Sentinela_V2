import type { Meta, StoryObj } from '@storybook/react';
import { Progress } from '@/components/ui/progress';

const meta: Meta<typeof Progress> = {
  title: 'UI/Progress',
  component: Progress,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { value: 50 } };
export const Empty: Story = { args: { value: 0 } };
export const Full: Story = { args: { value: 100 } };
export const Quarter: Story = { args: { value: 25 } };
export const ThreeQuarters: Story = { args: { value: 75 } };
