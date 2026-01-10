import type { Meta, StoryObj } from '@storybook/react';

// Placeholder component for story
const ReportBuilder = () => <div>ReportBuilder Component</div>;

const meta: Meta<typeof ReportBuilder> = {
  title: 'Components/ReportBuilder',
  component: ReportBuilder,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'ReportBuilder component for the Sentinela application.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof ReportBuilder>;

export const Default: Story = {
  args: {},
};

export const WithCustomProps: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'ReportBuilder with custom props.',
      },
    },
  },
};

export const Loading: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'ReportBuilder in loading state.',
      },
    },
  },
};

export const Error: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'ReportBuilder in error state.',
      },
    },
  },
};
