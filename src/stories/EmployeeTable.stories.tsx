import type { Meta, StoryObj } from '@storybook/react';

const EmployeeTable = () => <div>EmployeeTable Component</div>;

const meta: Meta<typeof EmployeeTable> = {
  title: 'Components/Employees/EmployeeTable',
  component: EmployeeTable,
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
