import type { Meta, StoryObj } from '@storybook/react';

// Placeholder component for story
const ExportButton = () => <div>ExportButton Component</div>;

const meta: Meta<typeof ExportButton> = {
  title: 'Components/ExportButton',
  component: ExportButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'ExportButton component for the Sentinela application.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof ExportButton>;

export const Default: Story = {
  args: {},
};

export const WithCustomProps: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'ExportButton with custom props.',
      },
    },
  },
};

export const Loading: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'ExportButton in loading state.',
      },
    },
  },
};

export const Error: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'ExportButton in error state.',
      },
    },
  },
};
