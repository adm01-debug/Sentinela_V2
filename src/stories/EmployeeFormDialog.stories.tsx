import type { Meta, StoryObj } from '@storybook/react';

const EmployeeFormDialog = () => <div>EmployeeFormDialog Component</div>;

const meta: Meta<typeof EmployeeFormDialog> = {
  title: 'Components/Employees/EmployeeFormDialog',
  component: EmployeeFormDialog,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Loading: Story = {
  args: {},
};

export const Empty: Story = {
  args: {},
};

export const WithData: Story = {
  args: {},
};
