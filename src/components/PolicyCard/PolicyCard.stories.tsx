import type { Meta, StoryObj } from '@storybook/react';

// Placeholder component for story
const PolicyCard = () => <div>PolicyCard Component</div>;

const meta: Meta<typeof PolicyCard> = {
  title: 'Components/PolicyCard',
  component: PolicyCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'PolicyCard component for the Sentinela application.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof PolicyCard>;

export const Default: Story = {
  args: {},
};

export const WithCustomProps: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'PolicyCard with custom props.',
      },
    },
  },
};

export const Loading: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'PolicyCard in loading state.',
      },
    },
  },
};

export const Error: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'PolicyCard in error state.',
      },
    },
  },
};
