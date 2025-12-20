import type { Meta, StoryObj } from '@storybook/react';

const PolicyFilters = () => <div>PolicyFilters Component</div>;

const meta: Meta<typeof PolicyFilters> = {
  title: 'Components/Policies/PolicyFilters',
  component: PolicyFilters,
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
