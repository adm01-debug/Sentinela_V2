import type { Meta, StoryObj } from '@storybook/react';

// Placeholder component for story
const AgentKeyCard = () => <div>AgentKeyCard Component</div>;

const meta: Meta<typeof AgentKeyCard> = {
  title: 'Components/AgentKeyCard',
  component: AgentKeyCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'AgentKeyCard component for the Sentinela application.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof AgentKeyCard>;

export const Default: Story = {
  args: {},
};

export const WithCustomProps: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'AgentKeyCard with custom props.',
      },
    },
  },
};

export const Loading: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'AgentKeyCard in loading state.',
      },
    },
  },
};

export const Error: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'AgentKeyCard in error state.',
      },
    },
  },
};
