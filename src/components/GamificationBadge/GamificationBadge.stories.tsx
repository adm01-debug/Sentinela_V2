import type { Meta, StoryObj } from '@storybook/react';

// Placeholder component for story
const GamificationBadge = () => <div>GamificationBadge Component</div>;

const meta: Meta<typeof GamificationBadge> = {
  title: 'Components/GamificationBadge',
  component: GamificationBadge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'GamificationBadge component for the Sentinela application.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof GamificationBadge>;

export const Default: Story = {
  args: {},
};

export const WithCustomProps: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'GamificationBadge with custom props.',
      },
    },
  },
};

export const Loading: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'GamificationBadge in loading state.',
      },
    },
  },
};

export const Error: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'GamificationBadge in error state.',
      },
    },
  },
};
