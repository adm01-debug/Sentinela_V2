import type { Meta, StoryObj } from '@storybook/react';
import { Alertdialog } from '../components/ui/alert-dialog';

const meta: Meta<typeof Alertdialog> = {
  title: 'UI/Alert Dialog',
  component: Alertdialog,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Alert Dialog component for the Sentinela UI library.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithCustomClass: Story = {
  args: {
    className: 'custom-class',
  },
};

export const Interactive: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    // Add interaction tests here
  },
};
