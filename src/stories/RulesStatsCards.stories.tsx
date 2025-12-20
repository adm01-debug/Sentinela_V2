import type { Meta, StoryObj } from '@storybook/react';

const RulesStatsCards = () => <div>RulesStatsCards Component</div>;

const meta: Meta<typeof RulesStatsCards> = {
  title: 'Components/Rules/RulesStatsCards',
  component: RulesStatsCards,
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
