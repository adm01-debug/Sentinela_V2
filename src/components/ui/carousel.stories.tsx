import type { Meta, StoryObj } from '@storybook/react';
import { carousel } from './carousel';

const meta: Meta<typeof carousel> = {
  title: 'UI/carousel',
  component: carousel,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof carousel>;

export const Default: Story = {};
