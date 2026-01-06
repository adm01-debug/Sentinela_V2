import type { Meta, StoryObj } from '@storybook/react';
import { ProgressIndicator } from '../components/ui/ProgressIndicator';

const meta: Meta<typeof ProgressIndicator> = {
  title: 'UI/ProgressIndicator',
  component: ProgressIndicator,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof ProgressIndicator>;

export const Default: Story = {
  args: { value: 60, max: 100 },
};

export const WithLabel: Story = {
  args: { value: 75, max: 100, showLabel: true, label: 'Progress' },
};

export const Small: Story = {
  args: { value: 40, size: 'sm' },
};

export const Large: Story = {
  args: { value: 80, size: 'lg' },
};

export const Circular: Story = {
  args: { value: 65, variant: 'circular', size: 'lg' },
};

export const Success: Story = {
  args: { value: 100, color: 'success', showLabel: true },
};

export const Warning: Story = {
  args: { value: 45, color: 'warning', showLabel: true },
};

export const Error: Story = {
  args: { value: 20, color: 'error', showLabel: true },
};
