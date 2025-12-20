import type { Meta, StoryObj } from '@storybook/react';
import { ExportStats } from '@/components/export/ExportStats';

const meta: Meta<typeof ExportStats> = {
  title: 'Components/Export/ExportStats',
  component: ExportStats,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    total: 45,
    completed: 40,
    failed: 3,
    processing: 2,
  },
};

export const AllCompleted: Story = {
  args: {
    total: 20,
    completed: 20,
    failed: 0,
    processing: 0,
  },
};

export const ManyFailed: Story = {
  args: {
    total: 30,
    completed: 15,
    failed: 10,
    processing: 5,
  },
};
