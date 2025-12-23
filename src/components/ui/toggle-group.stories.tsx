import type { Meta, StoryObj } from '@storybook/react';
import { togglegroup } from './togglegroup';

const meta: Meta<typeof togglegroup> = {
  title: 'UI/togglegroup',
  component: togglegroup,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof togglegroup>;

export const Default: Story = {};
