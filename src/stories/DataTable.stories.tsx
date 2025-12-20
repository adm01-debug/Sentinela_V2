import type { Meta, StoryObj } from '@storybook/react';
import { DataTable } from '@/components/ui/datatable';

const meta: Meta<typeof DataTable> = {
  title: 'UI/DataTable',
  component: DataTable,
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
