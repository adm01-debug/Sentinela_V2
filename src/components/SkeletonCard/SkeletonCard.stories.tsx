import type { Meta, StoryObj } from '@storybook/react';

// Placeholder component for story
const SkeletonCard = () => <div>SkeletonCard Component</div>;

const meta: Meta<typeof SkeletonCard> = {
  title: 'Components/SkeletonCard',
  component: SkeletonCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'SkeletonCard component for the Sentinela application.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof SkeletonCard>;

export const Default: Story = {
  args: {},
};

export const WithCustomProps: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'SkeletonCard with custom props.',
      },
    },
  },
};

export const Loading: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'SkeletonCard in loading state.',
      },
    },
  },
};

export const Error: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'SkeletonCard in error state.',
      },
    },
  },
};
