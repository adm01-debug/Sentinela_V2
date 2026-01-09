import type { Meta, StoryObj } from '@storybook/react';
import { Progress } from './Progress';

const meta: Meta<typeof Progress> = {
  title: 'Components/Progress',
  component: Progress,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { value: 60 } };
export const WithLabel: Story = { args: { value: 75, showLabel: true } };
export const Small: Story = { args: { value: 50, size: 'sm' } };
export const Large: Story = { args: { value: 50, size: 'lg' } };
export const Success: Story = { args: { value: 100, color: 'success' } };
export const Warning: Story = { args: { value: 50, color: 'warning' } };
export const Danger: Story = { args: { value: 25, color: 'danger' } };
export const Indeterminate: Story = { args: { indeterminate: true } };
export const Striped: Story = { args: { value: 60, striped: true } };
export const Animated: Story = { args: { value: 60, striped: true, animated: true } };
