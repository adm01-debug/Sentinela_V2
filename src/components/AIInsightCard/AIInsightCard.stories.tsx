import type { Meta, StoryObj } from '@storybook/react';

// Placeholder component for story
const AIInsightCard = () => <div>AIInsightCard Component</div>;

const meta: Meta<typeof AIInsightCard> = {
  title: 'Components/AIInsightCard',
  component: AIInsightCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'AIInsightCard component for the Sentinela application.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof AIInsightCard>;

export const Default: Story = {
  args: {},
};

export const WithCustomProps: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'AIInsightCard with custom props.',
      },
    },
  },
};

export const Loading: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'AIInsightCard in loading state.',
      },
    },
  },
};

export const Error: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'AIInsightCard in error state.',
      },
    },
  },
};
