import type { Meta, StoryObj } from '@storybook/react';
import { Carousel } from '../components/ui/carousel';

const meta: Meta<typeof Carousel> = {
  title: 'UI/Carousel',
  component: Carousel,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Carousel component for the Sentinela UI library.',
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
