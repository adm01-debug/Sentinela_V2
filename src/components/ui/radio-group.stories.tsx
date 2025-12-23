import type { Meta, StoryObj } from '@storybook/react';
import { radiogroup } from './radiogroup';

const meta: Meta<typeof radiogroup> = {
  title: 'UI/radiogroup',
  component: radiogroup,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof radiogroup>;

export const Default: Story = {};
