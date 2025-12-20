import type { Meta, StoryObj } from '@storybook/react';
import { ReportStats } from '@/components/reports/ReportStats';

const meta: Meta<typeof ReportStats> = {
  title: 'Components/Reports/ReportStats',
  component: ReportStats,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    total: 85,
    completed: 80,
    pending: 3,
    failed: 2,
  },
};

export const AllCompleted: Story = {
  args: {
    total: 50,
    completed: 50,
    pending: 0,
    failed: 0,
  },
};

export const ManyPending: Story = {
  args: {
    total: 100,
    completed: 60,
    pending: 30,
    failed: 10,
  },
};
