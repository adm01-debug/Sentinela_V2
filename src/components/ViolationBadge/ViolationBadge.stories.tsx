import type { Meta, StoryObj } from '@storybook/react';

// Placeholder component for story
const ViolationBadge = () => <div>ViolationBadge Component</div>;

const meta: Meta<typeof ViolationBadge> = {
  title: 'Components/ViolationBadge',
  component: ViolationBadge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'ViolationBadge component for the Sentinela application.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof ViolationBadge>;

export const Default: Story = {
  args: {},
};

export const WithCustomProps: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'ViolationBadge with custom props.',
      },
    },
  },
};

export const Loading: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'ViolationBadge in loading state.',
      },
    },
  },
};

export const Error: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'ViolationBadge in error state.',
      },
    },
  },
};
