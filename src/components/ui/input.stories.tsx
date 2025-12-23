import type { Meta, StoryObj } from '@storybook/react';
import { input } from './input';

const meta: Meta<typeof input> = {
  title: 'UI/input',
  component: input,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof input>;

export const Default: Story = {};
