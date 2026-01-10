import type { Meta, StoryObj } from '@storybook/react';

// Placeholder component for story
const PermissionGuard = () => <div>PermissionGuard Component</div>;

const meta: Meta<typeof PermissionGuard> = {
  title: 'Components/PermissionGuard',
  component: PermissionGuard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'PermissionGuard component for the Sentinela application.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof PermissionGuard>;

export const Default: Story = {
  args: {},
};

export const WithCustomProps: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'PermissionGuard with custom props.',
      },
    },
  },
};

export const Loading: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'PermissionGuard in loading state.',
      },
    },
  },
};

export const Error: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'PermissionGuard in error state.',
      },
    },
  },
};
