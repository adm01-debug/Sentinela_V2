import type { Meta, StoryObj } from '@storybook/react';
import { sheet } from './sheet';

const meta: Meta<typeof sheet> = {
  title: 'UI/sheet',
  component: sheet,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof sheet>;

export const Default: Story = {};
