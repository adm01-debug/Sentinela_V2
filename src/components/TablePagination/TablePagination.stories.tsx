import type { Meta, StoryObj } from '@storybook/react';
import { TablePagination } from './TablePagination';

const meta: Meta<typeof TablePagination> = {
  title: 'Components/TablePagination',
  component: TablePagination,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TablePagination>;

export const Default: Story = {};
