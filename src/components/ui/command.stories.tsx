import type { Meta, StoryObj } from '@storybook/react';
import { command } from './command';

const meta: Meta<typeof command> = {
  title: 'UI/command',
  component: command,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof command>;

export const Default: Story = {};
