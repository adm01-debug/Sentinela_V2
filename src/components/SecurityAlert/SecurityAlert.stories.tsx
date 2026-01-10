import type { Meta, StoryObj } from '@storybook/react';

// Placeholder component for story
const SecurityAlert = () => <div>SecurityAlert Component</div>;

const meta: Meta<typeof SecurityAlert> = {
  title: 'Components/SecurityAlert',
  component: SecurityAlert,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'SecurityAlert component for the Sentinela application.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof SecurityAlert>;

export const Default: Story = {
  args: {},
};

export const WithCustomProps: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'SecurityAlert with custom props.',
      },
    },
  },
};

export const Loading: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'SecurityAlert in loading state.',
      },
    },
  },
};

export const Error: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'SecurityAlert in error state.',
      },
    },
  },
};
