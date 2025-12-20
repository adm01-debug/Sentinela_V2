import type { Meta, StoryObj } from '@storybook/react';

const SchedulesListComponent = () => <div>SchedulesListComponent Component</div>;

const meta: Meta<typeof SchedulesListComponent> = {
  title: 'Components/Schedules/SchedulesListComponent',
  component: SchedulesListComponent,
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
