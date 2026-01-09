import type { Meta, StoryObj } from '@storybook/react';
import { DataCard } from './DataCard';

const meta: Meta<typeof DataCard> = {
  title: 'Components/DataCard',
  component: DataCard,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Employee Details',
    data: [
      { label: 'Name', value: 'John Doe' },
      { label: 'Email', value: 'john@example.com' },
      { label: 'Department', value: 'Engineering' },
    ],
  },
};
export const Horizontal: Story = { args: { ...Default.args, layout: 'horizontal' } };
export const WithActions: Story = {
  args: { ...Default.args, actions: [{ label: 'Edit', onClick: () => {} }, { label: 'Delete', onClick: () => {}, danger: true }] },
};
