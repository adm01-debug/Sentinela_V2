import type { Meta, StoryObj } from '@storybook/react';

// Placeholder component for story
const MonitoringCard = () => <div>MonitoringCard Component</div>;

const meta: Meta<typeof MonitoringCard> = {
  title: 'Components/MonitoringCard',
  component: MonitoringCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'MonitoringCard component for the Sentinela application.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof MonitoringCard>;

export const Default: Story = {
  args: {},
};

export const WithCustomProps: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'MonitoringCard with custom props.',
      },
    },
  },
};

export const Loading: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'MonitoringCard in loading state.',
      },
    },
  },
};

export const Error: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'MonitoringCard in error state.',
      },
    },
  },
};
