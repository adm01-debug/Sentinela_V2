import type { Meta, StoryObj } from '@storybook/react';

// Placeholder component for story
const MainLayout = () => <div>MainLayout Component</div>;

const meta: Meta<typeof MainLayout> = {
  title: 'Components/MainLayout',
  component: MainLayout,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'MainLayout component for the Sentinela application.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof MainLayout>;

export const Default: Story = {
  args: {},
};

export const WithCustomProps: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'MainLayout with custom props.',
      },
    },
  },
};

export const Loading: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'MainLayout in loading state.',
      },
    },
  },
};

export const Error: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'MainLayout in error state.',
      },
    },
  },
};
