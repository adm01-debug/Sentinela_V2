import type { Meta, StoryObj } from '@storybook/react';

// Placeholder component for story
const GeofenceMap = () => <div>GeofenceMap Component</div>;

const meta: Meta<typeof GeofenceMap> = {
  title: 'Components/GeofenceMap',
  component: GeofenceMap,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'GeofenceMap component for the Sentinela application.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof GeofenceMap>;

export const Default: Story = {
  args: {},
};

export const WithCustomProps: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'GeofenceMap with custom props.',
      },
    },
  },
};

export const Loading: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'GeofenceMap in loading state.',
      },
    },
  },
};

export const Error: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'GeofenceMap in error state.',
      },
    },
  },
};
