import type { Meta, StoryObj } from '@storybook/react';

// Placeholder component for story
const RateLimitBadge = () => <div>RateLimitBadge Component</div>;

const meta: Meta<typeof RateLimitBadge> = {
  title: 'Components/RateLimitBadge',
  component: RateLimitBadge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'RateLimitBadge component for the Sentinela application.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof RateLimitBadge>;

export const Default: Story = {
  args: {},
};

export const WithCustomProps: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'RateLimitBadge with custom props.',
      },
    },
  },
};

export const Loading: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'RateLimitBadge in loading state.',
      },
    },
  },
};

export const Error: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'RateLimitBadge in error state.',
      },
    },
  },
};
