import type { Meta, StoryObj } from '@storybook/react';

const MonitoringFilters = () => <div>MonitoringFilters Component</div>;

const meta: Meta<typeof MonitoringFilters> = {
  title: 'Components/Monitoring/MonitoringFilters',
  component: MonitoringFilters,
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
