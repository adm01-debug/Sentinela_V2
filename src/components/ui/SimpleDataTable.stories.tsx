import type { Meta, StoryObj } from '@storybook/react';
import { SimpleDataTable } from './SimpleDataTable';

const meta: Meta<typeof SimpleDataTable> = {
  title: 'UI/SimpleDataTable',
  component: SimpleDataTable,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SimpleDataTable>;

export const Default: Story = {};
