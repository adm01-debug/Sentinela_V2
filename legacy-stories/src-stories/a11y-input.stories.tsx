import type { Meta, StoryObj } from '@storybook/react';
import { A11Yinput } from '../components/ui/a11y-input';

const meta: Meta<typeof A11Yinput> = {
  title: 'UI/A11Y Input',
  component: A11Yinput,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A11Y Input component for the Sentinela UI library.',
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
