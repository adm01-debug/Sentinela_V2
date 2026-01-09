import type { Meta, StoryObj } from '@storybook/react';
import { Pagination } from './Pagination';

const meta: Meta<typeof Pagination> = {
  title: 'Components/Pagination',
  component: Pagination,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { total: 100, page: 1, pageSize: 10 } };
export const WithPageSizeSelector: Story = { args: { total: 100, page: 1, pageSize: 10, showSizeChanger: true } };
export const Simple: Story = { args: { total: 100, page: 5, pageSize: 10, simple: true } };
export const Small: Story = { args: { total: 50, page: 1, pageSize: 10, size: 'sm' } };
export const Large: Story = { args: { total: 50, page: 1, pageSize: 10, size: 'lg' } };
export const Disabled: Story = { args: { total: 50, page: 1, pageSize: 10, disabled: true } };
