import type { Meta, StoryObj } from '@storybook/react';

// Placeholder component for story
const TemplateEditor = () => <div>TemplateEditor Component</div>;

const meta: Meta<typeof TemplateEditor> = {
  title: 'Components/TemplateEditor',
  component: TemplateEditor,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'TemplateEditor component for the Sentinela application.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof TemplateEditor>;

export const Default: Story = {
  args: {},
};

export const WithCustomProps: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'TemplateEditor with custom props.',
      },
    },
  },
};

export const Loading: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'TemplateEditor in loading state.',
      },
    },
  },
};

export const Error: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'TemplateEditor in error state.',
      },
    },
  },
};
