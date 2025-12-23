import type { Meta, StoryObj } from '@storybook/react';
import { hovercard } from './hovercard';

const meta: Meta<typeof hovercard> = {
  title: 'UI/hovercard',
  component: hovercard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof hovercard>;

export const Default: Story = {};
