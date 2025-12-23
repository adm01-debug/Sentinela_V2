import type { Meta, StoryObj } from '@storybook/react';
import { progress } from './progress';

const meta: Meta<typeof progress> = {
  title: 'UI/progress',
  component: progress,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof progress>;

export const Default: Story = {};
