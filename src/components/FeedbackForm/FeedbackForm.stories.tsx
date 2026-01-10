import type { Meta, StoryObj } from '@storybook/react';

// Placeholder component for story
const FeedbackForm = () => <div>FeedbackForm Component</div>;

const meta: Meta<typeof FeedbackForm> = {
  title: 'Components/FeedbackForm',
  component: FeedbackForm,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'FeedbackForm component for the Sentinela application.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof FeedbackForm>;

export const Default: Story = {
  args: {},
};

export const WithCustomProps: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'FeedbackForm with custom props.',
      },
    },
  },
};

export const Loading: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'FeedbackForm in loading state.',
      },
    },
  },
};

export const Error: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'FeedbackForm in error state.',
      },
    },
  },
};
