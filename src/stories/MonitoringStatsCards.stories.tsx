import type { Meta, StoryObj } from '@storybook/react';

const MonitoringStatsCards = () => <div>MonitoringStatsCards Component</div>;

const meta: Meta<typeof MonitoringStatsCards> = {
  title: 'Components/Monitoring/MonitoringStatsCards',
  component: MonitoringStatsCards,
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
