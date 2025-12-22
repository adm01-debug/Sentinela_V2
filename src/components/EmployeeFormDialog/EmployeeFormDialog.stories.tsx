import type { Meta, StoryObj } from '@storybook/react';
import { EmployeeFormDialog } from './EmployeeFormDialog';

const meta: Meta<typeof EmployeeFormDialog> = {
  title: 'Components/EmployeeFormDialog',
  component: EmployeeFormDialog,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof EmployeeFormDialog>;

export const Default: Story = {};
