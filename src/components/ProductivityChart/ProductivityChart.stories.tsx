import type { Meta, StoryObj } from '@storybook/react';

// Placeholder component for story
const ProductivityChart = () => <div>ProductivityChart Component</div>;

const meta: Meta<typeof ProductivityChart> = {
  title: 'Components/ProductivityChart',
  component: ProductivityChart,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'ProductivityChart component for the Sentinela application.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof ProductivityChart>;

export const Default: Story = {
  args: {},
};

export const WithCustomProps: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'ProductivityChart with custom props.',
      },
    },
  },
};

export const Loading: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'ProductivityChart in loading state.',
      },
    },
  },
};

export const Error: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'ProductivityChart in error state.',
      },
    },
  },
};
