import type { Meta, StoryObj } from '@storybook/react';

// Placeholder component for story
const DashboardWidget = () => <div>DashboardWidget Component</div>;

const meta: Meta<typeof DashboardWidget> = {
  title: 'Components/DashboardWidget',
  component: DashboardWidget,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'DashboardWidget component for the Sentinela application.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof DashboardWidget>;

export const Default: Story = {
  args: {},
};

export const WithCustomProps: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'DashboardWidget with custom props.',
      },
    },
  },
};

export const Loading: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'DashboardWidget in loading state.',
      },
    },
  },
};

export const Error: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'DashboardWidget in error state.',
      },
    },
  },
};
