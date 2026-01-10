import type { Meta, StoryObj } from '@storybook/react';

// Placeholder component for story
const AuthForm = () => <div>AuthForm Component</div>;

const meta: Meta<typeof AuthForm> = {
  title: 'Components/AuthForm',
  component: AuthForm,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'AuthForm component for the Sentinela application.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof AuthForm>;

export const Default: Story = {
  args: {},
};

export const WithCustomProps: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'AuthForm with custom props.',
      },
    },
  },
};

export const Loading: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'AuthForm in loading state.',
      },
    },
  },
};

export const Error: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'AuthForm in error state.',
      },
    },
  },
};
