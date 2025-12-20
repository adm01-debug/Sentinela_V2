import type { Meta, StoryObj } from '@storybook/react';

const EmployeeFilters = () => <div>EmployeeFilters Component</div>;

const meta: Meta<typeof EmployeeFilters> = {
  title: 'Components/Employees/EmployeeFilters',
  component: EmployeeFilters,
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
