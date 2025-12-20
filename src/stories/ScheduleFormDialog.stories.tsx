import type { Meta, StoryObj } from '@storybook/react';

const ScheduleFormDialog = () => <div>ScheduleFormDialog Component</div>;

const meta: Meta<typeof ScheduleFormDialog> = {
  title: 'Components/Schedules/ScheduleFormDialog',
  component: ScheduleFormDialog,
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
