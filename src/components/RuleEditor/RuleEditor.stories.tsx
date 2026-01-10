import type { Meta, StoryObj } from '@storybook/react';

// Placeholder component for story
const RuleEditor = () => <div>RuleEditor Component</div>;

const meta: Meta<typeof RuleEditor> = {
  title: 'Components/RuleEditor',
  component: RuleEditor,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'RuleEditor component for the Sentinela application.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof RuleEditor>;

export const Default: Story = {
  args: {},
};

export const WithCustomProps: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'RuleEditor with custom props.',
      },
    },
  },
};

export const Loading: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'RuleEditor in loading state.',
      },
    },
  },
};

export const Error: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'RuleEditor in error state.',
      },
    },
  },
};
