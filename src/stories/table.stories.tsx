import type { Meta, StoryObj } from '@storybook/react';
import { Table } from '../components/ui/table';

const meta: Meta<typeof Table> = {
  title: 'UI/Table',
  component: Table,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithCustomClass: Story = { args: { className: 'custom-class' } };
