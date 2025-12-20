import type { Meta, StoryObj } from '@storybook/react';

const EmployeeMonitoringCard = () => <div>EmployeeMonitoringCard Component</div>;

const meta: Meta<typeof EmployeeMonitoringCard> = {
  title: 'Components/Monitoring/EmployeeMonitoringCard',
  component: EmployeeMonitoringCard,
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
