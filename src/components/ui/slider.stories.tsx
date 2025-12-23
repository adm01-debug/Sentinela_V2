import type { Meta, StoryObj } from '@storybook/react';
import { slider } from './slider';

const meta: Meta<typeof slider> = {
  title: 'UI/slider',
  component: slider,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof slider>;

export const Default: Story = {};
