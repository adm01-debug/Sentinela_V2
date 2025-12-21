import type { Meta, StoryObj } from '@storybook/react';
import { Aspectratio } from '../components/ui/aspect-ratio';

const meta: Meta<typeof Aspectratio> = {
  title: 'UI/Aspect Ratio',
  component: Aspectratio,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Aspect Ratio component for the Sentinela UI library.',
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
