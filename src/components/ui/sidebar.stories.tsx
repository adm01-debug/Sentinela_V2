import type { Meta, StoryObj } from '@storybook/react';
import { sidebar } from './sidebar';

const meta: Meta<typeof sidebar> = {
  title: 'UI/sidebar',
  component: sidebar,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof sidebar>;

export const Default: Story = {};
