import type { Meta, StoryObj } from '@storybook/react';

const PolicyAcknowledgmentsTable = () => <div>PolicyAcknowledgmentsTable Component</div>;

const meta: Meta<typeof PolicyAcknowledgmentsTable> = {
  title: 'Components/Policies/PolicyAcknowledgmentsTable',
  component: PolicyAcknowledgmentsTable,
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
