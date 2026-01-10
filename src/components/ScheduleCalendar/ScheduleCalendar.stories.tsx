import type { Meta, StoryObj } from '@storybook/react';

// Placeholder component for story
const ScheduleCalendar = () => <div>ScheduleCalendar Component</div>;

const meta: Meta<typeof ScheduleCalendar> = {
  title: 'Components/ScheduleCalendar',
  component: ScheduleCalendar,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'ScheduleCalendar component for the Sentinela application.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof ScheduleCalendar>;

export const Default: Story = {
  args: {},
};

export const WithCustomProps: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'ScheduleCalendar with custom props.',
      },
    },
  },
};

export const Loading: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'ScheduleCalendar in loading state.',
      },
    },
  },
};

export const Error: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'ScheduleCalendar in error state.',
      },
    },
  },
};
