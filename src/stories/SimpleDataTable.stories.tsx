import type { Meta, StoryObj } from '@storybook/react';
import { SimpleDataTable } from '@/components/ui/simpledatatable';

const meta: Meta<typeof SimpleDataTable> = {
  title: 'UI/SimpleDataTable',
  component: SimpleDataTable,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithProps: Story = {
  args: {},
};
