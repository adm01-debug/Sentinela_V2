import type { Meta, StoryObj } from '@storybook/react';

const DeviceAssignDialog = () => <div>DeviceAssignDialog Component</div>;

const meta: Meta<typeof DeviceAssignDialog> = {
  title: 'Components/Employees/DeviceAssignDialog',
  component: DeviceAssignDialog,
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
