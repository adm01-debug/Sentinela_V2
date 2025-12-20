import type { Meta, StoryObj } from '@storybook/react';

const ScheduleStatsCards = () => <div>ScheduleStatsCards Component</div>;

const meta: Meta<typeof ScheduleStatsCards> = {
  title: 'Components/Schedules/ScheduleStatsCards',
  component: ScheduleStatsCards,
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
