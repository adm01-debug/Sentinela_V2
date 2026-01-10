import type { Meta, StoryObj } from '@storybook/react';

// Placeholder component for story
const MobileBottomNav = () => <div>MobileBottomNav Component</div>;

const meta: Meta<typeof MobileBottomNav> = {
  title: 'Components/MobileBottomNav',
  component: MobileBottomNav,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'MobileBottomNav component for the Sentinela application.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof MobileBottomNav>;

export const Default: Story = {
  args: {},
};

export const WithCustomProps: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'MobileBottomNav with custom props.',
      },
    },
  },
};

export const Loading: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'MobileBottomNav in loading state.',
      },
    },
  },
};

export const Error: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'MobileBottomNav in error state.',
      },
    },
  },
};
