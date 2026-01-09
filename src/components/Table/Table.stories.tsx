import type { Meta, StoryObj } from '@storybook/react';
import { Table } from './Table';

const meta: Meta<typeof Table> = {
  title: 'Components/Table',
  component: Table,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const columns = [
  { key: 'name', title: 'Name', sortable: true },
  { key: 'email', title: 'Email' },
  { key: 'role', title: 'Role' },
  { key: 'status', title: 'Status' },
];

const data = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active' },
  { id: 3, name: 'Bob Wilson', email: 'bob@example.com', role: 'User', status: 'Inactive' },
];

export const Default: Story = { args: { columns, data } };
export const Striped: Story = { args: { columns, data, striped: true } };
export const Hoverable: Story = { args: { columns, data, hoverable: true } };
export const Selectable: Story = { args: { columns, data, selectable: true } };
export const Loading: Story = { args: { columns, data: [], loading: true } };
export const Empty: Story = { args: { columns, data: [], emptyText: 'No records found' } };
export const WithPagination: Story = { args: { columns, data, pagination: { page: 1, pageSize: 10, total: 100 } } };
