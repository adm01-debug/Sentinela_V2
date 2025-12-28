import type { Meta, StoryObj } from '@storybook/react';
import { switch } from './switch';

const meta: Meta<typeof switch> = {
  title: 'UI/switch',
  component: switch,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof switch>;

export const Default: Story = {};
