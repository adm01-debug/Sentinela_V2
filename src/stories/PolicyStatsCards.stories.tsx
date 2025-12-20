import type { Meta, StoryObj } from '@storybook/react';

const PolicyStatsCards = () => <div>PolicyStatsCards Component</div>;

const meta: Meta<typeof PolicyStatsCards> = {
  title: 'Components/Policies/PolicyStatsCards',
  component: PolicyStatsCards,
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
