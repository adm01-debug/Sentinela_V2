import type { Meta, StoryObj } from '@storybook/react';
import { SecurityMetrics } from '@/components/SecurityMetrics';

const meta: Meta<typeof SecurityMetrics> = {
  title: 'Components/SecurityMetrics',
  component: SecurityMetrics,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof SecurityMetrics>;

export const Default: Story = { args: {} };
export const WithCustomClass: Story = { args: { className: 'custom-class' } };
