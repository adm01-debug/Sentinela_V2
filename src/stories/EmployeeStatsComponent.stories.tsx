import type { Meta, StoryObj } from '@storybook/react';

const EmployeeStatsComponent = () => <div>EmployeeStatsComponent Component</div>;

const meta: Meta<typeof EmployeeStatsComponent> = {
  title: 'Components/Employees/EmployeeStatsComponent',
  component: EmployeeStatsComponent,
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
