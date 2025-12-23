import type { Meta, StoryObj } from '@storybook/react';
import { card } from './card';

const meta: Meta<typeof card> = {
  title: 'UI/card',
  component: card,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof card>;

export const Default: Story = {};
